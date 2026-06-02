import { getAnthropicClient } from '@objectflow/agents-core';
import { env } from '@objectflow/config';

export async function runSmokeTestAgent(prompt: string): Promise<string> {
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
  return block.text;
}
