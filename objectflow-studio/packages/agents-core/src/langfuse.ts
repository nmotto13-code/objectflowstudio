import { Langfuse } from 'langfuse';
import { env } from '@objectflow/config';

let _langfuse: Langfuse | undefined;

export function getLangfuse(): Langfuse | undefined {
  if (!env.LANGFUSE_PUBLIC_KEY || !env.LANGFUSE_SECRET_KEY) return undefined;
  if (!_langfuse) {
    _langfuse = new Langfuse({
      publicKey: env.LANGFUSE_PUBLIC_KEY,
      secretKey: env.LANGFUSE_SECRET_KEY,
      baseUrl: env.LANGFUSE_HOST,
    });
  }
  return _langfuse;
}
