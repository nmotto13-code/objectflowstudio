import Anthropic from '@anthropic-ai/sdk';
import { env } from '@objectflow/config';

let _client: Anthropic | undefined;

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}
