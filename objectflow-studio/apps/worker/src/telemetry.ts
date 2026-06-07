// MUST be imported AFTER load-env.ts and BEFORE any module that uses the
// Anthropic SDK. OpenTelemetry instrumentation has to register patches before
// the target module is required/imported.
//
// Sets up:
//   - @opentelemetry/sdk-node (Node OTel runtime)
//   - @langfuse/otel LangfuseSpanProcessor (exports spans to Langfuse Cloud)
//   - @arizeai/openinference-instrumentation-anthropic (auto-traces every
//     anthropic.messages.create() call: model, input, output, usage, latency)
//
// Every Anthropic SDK call across the worker — including future agents like
// IngestionAgent, SchemaInferenceAgent, etc. — will produce a Langfuse trace
// automatically without changes to the agent code.

import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor, isDefaultExportSpan } from '@langfuse/otel';
import { AnthropicInstrumentation } from '@arizeai/openinference-instrumentation-anthropic';
import { trace as otelTrace } from '@opentelemetry/api';
import type { SpanProcessor, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import type { Context } from '@opentelemetry/api';

// Diagnostic SpanProcessor for the L0->L1 Langfuse export gap. Runs in
// parallel with LangfuseSpanProcessor — if our onEnd fires but Langfuse's
// shouldExportSpan log doesn't, the SDK isn't actually registering Langfuse
// (Langfuse-side bug or config mismatch). If neither fires, the global
// TracerProvider isn't the NodeSDK one (API version split or SDK didn't
// actually register).
class DiagnosticSpanProcessor implements SpanProcessor {
  onStart(span: ReadableSpan, _parentContext: Context): void {
    console.log(
      `[telemetry-debug] diag onStart — name="${span.name}" scope="${span.instrumentationScope.name}"`,
    );
  }
  onEnd(span: ReadableSpan): void {
    console.log(
      `[telemetry-debug] diag onEnd — name="${span.name}" scope="${span.instrumentationScope.name}" durationNs=${span.duration[0] * 1e9 + span.duration[1]}`,
    );
  }
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}

let _sdk: NodeSDK | undefined;
let _langfuseProcessor: LangfuseSpanProcessor | undefined;

if (process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY) {
  // The Anthropic SDK instrumentation needs to patch the module before it's
  // imported anywhere else. Calling manuallyInstrument with the SDK class
  // ensures patching even when the SDK has already been required.
  const anthropicInstrumentation = new AnthropicInstrumentation();
  // Dynamic import so OTel can patch before the Anthropic module is used.
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  anthropicInstrumentation.manuallyInstrument(Anthropic);

  _langfuseProcessor = new LangfuseSpanProcessor({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL ?? 'https://cloud.langfuse.com',
    environment: process.env.NODE_ENV ?? 'development',
    // The default filter only exports spans Langfuse natively recognizes
    // (its own SDK + a handful of integrations). It drops OpenInference spans
    // and our custom worker spans. Compose with isDefaultExportSpan so we keep
    // the default allowlist AND include the scopes we explicitly want.
    shouldExportSpan: ({ otelSpan }) => {
      const scope = otelSpan.instrumentationScope.name;
      const decision =
        isDefaultExportSpan(otelSpan) ||
        scope.startsWith('@arizeai/openinference') ||
        scope === 'objectflow-worker';
      // Diagnostic for the L0->L1 Langfuse trace export gap: log every span
      // the processor evaluates so we can tell (from Railway logs) whether
      // spans are even reaching the LangfuseSpanProcessor on production runs.
      // - lines present, exported=true → spans flow; failure is downstream
      //   (Langfuse export call or auth)
      // - lines present, exported=false → filter is too strict
      // - lines absent for a Completed Inngest run → instrumentation isn't
      //   producing spans (tracer is no-op or SDK didn't register globally)
      // Remove this log once the trace pipeline is verified end-to-end.
      console.log(
        `[telemetry-debug] span seen — scope="${scope}" name="${otelSpan.name}" exported=${decision}`,
      );
      return decision;
    },
  });

  _sdk = new NodeSDK({
    spanProcessors: [_langfuseProcessor, new DiagnosticSpanProcessor()],
    instrumentations: [anthropicInstrumentation],
  });
  _sdk.start();

  // After SDK start, log what the global tracer provider actually is and
  // whether the returned tracer is a real one (vs the NoopTracer that's
  // returned when no provider is registered).
  const globalProvider = otelTrace.getTracerProvider();
  const probeTracer = otelTrace.getTracer('telemetry-self-probe');
  console.log(
    `[telemetry-debug] global provider class="${globalProvider.constructor.name}" tracer class="${probeTracer.constructor.name}"`,
  );
  // Synthetic span: if onStart/onEnd fire on the diagnostic processor for
  // this span, the SDK wiring works and the bug is in agent code; if not,
  // the wiring is broken at the SDK level.
  const probeSpan = probeTracer.startSpan('telemetry-self-probe-span');
  probeSpan.setAttribute('telemetry.probe', true);
  probeSpan.end();
  console.log('[telemetry-debug] synthetic probe span ended');

  // Graceful shutdown — ensure spans are flushed on SIGTERM/SIGINT.
  const shutdown = async () => {
    try {
      await _langfuseProcessor?.forceFlush();
      await _sdk?.shutdown();
    } catch (err) {
      console.error('Telemetry shutdown error:', err);
    }
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  console.log('[telemetry] Langfuse OTel + Anthropic auto-instrumentation initialized');
} else {
  console.log('[telemetry] Langfuse keys not set — skipping telemetry init');
}

/**
 * Force-flush traces. Call inside short-lived contexts (Inngest steps, scripts)
 * to make sure spans reach Langfuse before the function returns.
 */
export async function flushTelemetry(): Promise<void> {
  await _langfuseProcessor?.forceFlush();
}
