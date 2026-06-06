/**
 * Tsup config for the Fastify worker.
 *
 * Why we bundle: workspace packages (@objectflow/db, /config, /events, etc.)
 * publish their `main` as raw TypeScript source (`./src/index.ts`). That works
 * in dev because `tsx` runs TS directly, and works for the Next.js web app
 * because Next's bundler transpiles workspace packages via `transpilePackages`.
 * For a plain `node dist/server.js` runtime, we need to inline those TS deps
 * — otherwise Node hits `./client.js` imports that point at files that don't
 * exist on disk (the actual files are `.ts`).
 *
 * What we bundle: workspace packages only (`noExternal: /^@objectflow\//`).
 * Everything else stays external (smaller bundle, faster build, easier to
 * debug stack traces, native modules like sharp/bcrypt would break if bundled).
 *
 * Sourcemap: emitted so Sentry can map stack traces back to original TS.
 *
 * Target: node22 — Railway's default container runtime supports Node 22 LTS,
 * which has stable top-level await, the Fetch API, and the same module
 * semantics as our dev environment (Node 24).
 */
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',

  // One self-contained file. No code-splitting (single entry, no benefit).
  bundle: true,
  splitting: false,

  // Bundle workspace TS source. Everything else stays as `import` against
  // node_modules so we don't accidentally bundle pino's worker-thread
  // transport (would break runtime log shipping) or any native addon.
  noExternal: [/^@objectflow\//],

  // Output ergonomics
  outDir: 'dist',
  clean: true,
  sourcemap: true,

  // Worker imports a few packages with mixed ESM/CJS interop quirks (pino
  // transports, OpenTelemetry). Keep their runtime shape intact.
  skipNodeModulesBundle: true,

  // Don't generate .d.ts — typecheck is `tsc --noEmit` in a separate script.
  dts: false,
});
