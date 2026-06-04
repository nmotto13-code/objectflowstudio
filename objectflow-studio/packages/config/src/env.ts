import { z } from 'zod';

/**
 * Helper: treat empty strings as undefined. Lets us comment-out optional vars
 * in .env files without tripping `min(1)` validation, while still flagging
 * truly missing required vars.
 */
const optionalString = (min = 1) =>
  z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().min(min).optional(),
  );

const requiredUrl = z.string().url();

/**
 * Single source of truth for env vars. Fails fast at boot if anything required
 * is missing. Add new vars here AND in .env.example.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Database
  DATABASE_URL: requiredUrl,
  DATABASE_DIRECT_URL: optionalString(),

  // Redis
  REDIS_URL: optionalString(),

  // Auth0
  AUTH0_DOMAIN: optionalString(),
  AUTH0_CLIENT_ID: optionalString(),
  AUTH0_CLIENT_SECRET: optionalString(),
  AUTH0_AUDIENCE: optionalString(),
  AUTH0_M2M_CLIENT_ID: optionalString(),
  AUTH0_M2M_CLIENT_SECRET: optionalString(),
  AUTH0_BASE_URL: optionalString(),
  AUTH0_SECRET: optionalString(32),
  AUTH0_ISSUER_BASE_URL: optionalString(),
  APP_BASE_URL: optionalString(), // Used by @auth0/nextjs-auth0 v4

  // Anthropic
  ANTHROPIC_API_KEY: optionalString(),
  ANTHROPIC_DEFAULT_MODEL: z.string().default('claude-sonnet-4-6'),
  ANTHROPIC_REASONING_MODEL: z.string().default('claude-opus-4-7'),

  // Inngest
  INNGEST_EVENT_KEY: optionalString(),
  INNGEST_SIGNING_KEY: optionalString(),
  INNGEST_DEV: z.coerce.boolean().default(false),

  // Cloudflare R2
  R2_ACCOUNT_ID: optionalString(),
  R2_ACCESS_KEY_ID: optionalString(),
  R2_SECRET_ACCESS_KEY: optionalString(),
  R2_BUCKET: optionalString(),
  R2_PUBLIC_URL: optionalString(),

  // Langfuse — current SDK convention is LANGFUSE_BASE_URL; LANGFUSE_HOST kept
  // for backward compat with the old `langfuse` client package.
  LANGFUSE_PUBLIC_KEY: optionalString(),
  LANGFUSE_SECRET_KEY: optionalString(),
  LANGFUSE_BASE_URL: z.string().url().default('https://cloud.langfuse.com'),
  LANGFUSE_HOST: z.string().url().default('https://cloud.langfuse.com'),

  // Sentry — separate projects for web vs worker so we can filter dashboards
  SENTRY_DSN: optionalString(), // legacy alias; prefer SENTRY_DSN_{WEB,WORKER}
  SENTRY_DSN_WEB: optionalString(),
  SENTRY_DSN_WORKER: optionalString(),
  NEXT_PUBLIC_SENTRY_DSN_WEB: optionalString(),

  // Logs
  LOGTAIL_SOURCE_TOKEN: optionalString(),

  // Worker
  WORKER_URL: z.string().url().default('http://localhost:4000'),
  WORKER_INTERNAL_SECRET: optionalString(16),

  // Web
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export type Env = z.infer<typeof schema>;
