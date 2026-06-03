import { trace as otelTrace } from '@opentelemetry/api';
import { getAnthropicClient } from '@objectflow/agents-core';
import { env } from '@objectflow/config';
import { flushTelemetry } from '../telemetry.js';

/**
 * L0 smoke agent: calls Claude with a trivial prompt.
 *
 * Tracing is fully automatic via @arizeai/openinference-instrumentation-anthropic
 * (set up in telemetry.ts) — every `client.messages.create()` produces a
 * Langfuse generation with model, input messages, output, token usage, and
 * latency, with zero manual instrumentation code.
 *
 * We wrap the call in a named OTel span so the trace gets a meaningful name
 * (`smoke-test-agent`) and any future agent context (sessionId, userId, etc.)
 * can hang off this parent span instead of the bare Anthropic call.
 */
export async function runSmokeTestAgent(prompt: string): Promise<string> {
  const tracer = otelTrace.getTracer('objectflow-worker');
  return tracer.startActiveSpan('smoke-test-agent', async (span) => {
    span.setAttribute('agent.layer', 'L0');
    span.setAttribute('agent.name', 'smoke-test');

    try {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: env.ANTHROPIC_DEFAULT_MODEL,
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });
      const block = response.content[0];
      if (!block || block.type !== 'text') {
        throw new Error('Unexpected response type from Anthropic');
      }
      span.setAttribute('agent.response.length', block.text.length);
      return block.text;
    } finally {
      span.end();
      // Short-lived Inngest step — flush traces before returning.
      await flushTelemetry();
    }
  });
}
