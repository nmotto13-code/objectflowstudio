import { inngest } from '../client.js';
import { runSmokeTestAgent } from '../../agents/smoke-test.js';

/**
 * L0 smoke test: triggered by `system/smoke.test.requested`, invokes a Mastra
 * agent that calls Claude with a trivial prompt and returns the text. This
 * proves Inngest + Mastra + Anthropic SDK + Langfuse all wired correctly.
 */
export const smokeTestAgentFn = inngest.createFunction(
  { id: 'smoke-test-agent', name: 'L0 smoke: Mastra agent calls Claude' },
  { event: 'system/smoke.test.requested' },
  async ({ event, step }) => {
    const result = await step.run('invoke-agent', async () => {
      return runSmokeTestAgent(event.data.prompt ?? 'Say "ObjectFlow ready" and nothing else.');
    });
    return { ok: true, agentResponse: result };
  },
);
