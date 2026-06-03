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
      return (
        isDefaultExportSpan(otelSpan) ||
        scope.startsWith('@arizeai/openinference') ||
        scope === 'objectflow-worker'
      );
    },
  });

  _sdk = new NodeSDK({
    spanProcessors: [_langfuseProcessor],
    instrumentations: [anthropicInstrumentation],
  });
  _sdk.start();

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
