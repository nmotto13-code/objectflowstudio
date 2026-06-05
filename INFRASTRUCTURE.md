# ObjectFlow Studio — Infrastructure Summary

A plain-language record of what each piece of infrastructure does for the platform and what lives there. Updated as we provision each service. For the build-task tracker see [PROGRESS.md](PROGRESS.md); for the technical decisions see `memory/project_stack_decisions.md`.

**Legend:** ✅ live · 🟡 in progress · ⚪ planned, not yet provisioned

---

## Live infrastructure

### ✅ GitHub Actions — continuous integration
**Role in the product:** The guardrail that catches broken code before it merges. Every PR and every push to `main` runs install + lint + typecheck + build + test. If anything fails, the PR can't merge (once branch protection is enabled) and the failure is visible right in the PR.

**Why it matters:** Local dev environments drift — different Node versions, missing dependencies, accidental untracked files in the working tree. CI runs in a clean Ubuntu container with the exact pnpm/Node versions pinned in `package.json`, so a green check means "this would build for any teammate who pulled fresh." It also enforces `pnpm-lock.yaml` consistency via `--frozen-lockfile`, catching PRs that forgot to commit lockfile updates.

**What's wired today:** `.github/workflows/ci.yml` — single job on `ubuntu-latest`, pnpm 11.5.0 + Node 22, with both the pnpm store and Turbo's build cache layered for fast incremental runs. Sentinel env values (dummy Postgres URL, 32-char dummy Auth0 secret, 16-char worker secret) satisfy `packages/config` validation during Next's build-time route evaluation without involving real secrets. Concurrency group cancels superseded runs on rapid force-pushes. First run on commit `63ad178` went green in 1m 44s. Future steps will add the Doppler GitHub Actions integration for E2E tests that need real credentials.

---

### ✅ Doppler — secret management
**Role in the product:** Single source of truth for every secret across every environment. Dev, staging, prod, and CI all read from Doppler instead of from plaintext `.env` files. When we rotate an API key, we update one value in Doppler and every environment that integrates with it picks up the new value automatically.

**Why it matters:** With ~12 secrets across 8 services (Postgres, Redis, Auth0, Anthropic, Inngest, Langfuse, Sentry, R2, Better Stack), the manual alternative is pasting each value into every dashboard whenever anything rotates — a multi-step manual process that drifts out of sync. Doppler eliminates the drift and the plaintext-on-disk attack surface.

**What's wired today:** Project `objectflow-studio` with a `dev` config holding every secret previously in `.env.local`. The CLI is installed locally (v3.76) and the project is bound (machine-level config under `D:\objectflow\objectflow-studio`). Local dev workflow: `doppler run -- pnpm dev` (also available as `pnpm dev:doppler`). `.env.local` has been deleted from disk; the env-loaders in each app and the db package now check `existsSync` before reading it, so the file is purely optional fallback for collaborators not on Doppler. Integrations to Vercel + Railway + GitHub Actions are deferred to L0's deploy phase.

---

### ✅ Railway — Postgres database
**Role in the product:** The single source of truth for everything durable. Every piece of customer data — workspaces, users, business objects, schemas, records, audit logs, agent run history — lives here. When a user uploads a file, the file metadata, inferred schema, ingested rows, and every approval decision afterward all end up in this database. If we lost it, we'd lose the product; if we corrupted it, customers would lose trust.

**Why Postgres specifically:** It handles both structured tables (workspaces, users, roles) and semi-structured JSON data (the actual record contents whose shape varies per business object) in the same engine. That lets us avoid running two databases and keeps everything transactionally consistent — when a record is approved, the curated record write and the audit event write either both succeed or both fail.

**What lives there today:** A single `_health` table proving the connection works. Real tables arrive in L1+.

---

### ✅ Railway — Redis cache and job queue
**Role in the product:** The fast-lane for short-lived data and background work coordination. Two main jobs:
1. **Job queue.** When a user uploads a CSV, we don't make them wait while we parse 100K rows, infer the schema, and ingest. We push a job onto Redis and immediately return; a worker picks it up and processes asynchronously. This is how the platform stays responsive under load.
2. **Cache.** Compiled schema definitions, permission lookups, and other frequently-read data sit here so we don't hit Postgres for every page load.

**Why we need it from day one:** Even at L0 the architecture assumes background work exists. Building the foundation without Redis would mean refactoring later when ingestion gets heavy.

**What lives there today:** Nothing yet — connection verified, ready for L3's ingestion pipeline.

---

### ✅ pgvector — AI similarity search inside Postgres
**Role in the product:** Lets the platform answer "is this record a duplicate of something we already have?" and "find records that look semantically similar to this one." We turn each record into a numeric fingerprint (an "embedding") generated by Claude, store it alongside the record in Postgres, and use pgvector to find nearby fingerprints fast.

**Why it matters:** The CurationAgent (L5) uses this to flag likely duplicates during review. The AssistantAgent (L10) uses this to answer "show me records similar to this one" without us having to write custom indexing.

**Why inside Postgres instead of a separate vector database:** One database is simpler than two. Pinecone, Turbopuffer, and Weaviate are faster at extreme scale but add a service to operate and a sync problem (keeping embeddings consistent with the records they describe). We move to them only when we outgrow pgvector — usually millions of records per workspace.

**What lives there today:** Extension installed (v0.8.2). First embeddings get written in L5.

---

### ✅ Auth0 — identity and access management
**Role in the product:** Owns "who is this user, what organization do they belong to, what are they allowed to do." Every request to the platform carries a signed token from Auth0; our backend verifies it and decides what the user can read or change. Auth0 also handles password storage, social logins (Google/Microsoft), enterprise SSO (when a customer wants SAML or Active Directory integration), and multi-factor authentication — all things we'd otherwise have to build and harden ourselves.

**Why it matters:** Identity is the part of a SaaS product you cannot afford to get wrong. A flaw here means data leaking between customers. Outsourcing it to Auth0 means our security posture rises to enterprise standards (SOC 2, ISO 27001) on day one rather than year three.

**Multi-tenancy approach:** Each customer organization becomes an Auth0 "Organization." Users belong to one or more Organizations and pick which one they're logging into. Roles (Admin, Builder, Reviewer, etc.) live in Auth0 and ride along inside the JWT.

**What's wired today:** Tenant `dev-gh1ftkwgayfwa5e1.us.auth0.com`, "Regular Web Application" for the Next.js app, "ObjectFlow API" with audience `https://api.objectflow.studio`, Organizations enabled with "Prompt for Organization" login flow. Next.js middleware mounts `/auth/login`, `/auth/logout`, `/auth/callback`, `/auth/profile`. A protected page at `/protected` reads session claims server-side. Google social login verified end-to-end. Roles, Organizations, and the workspace-sync layer come in L1.

**Known follow-ups:** (1) Tenant-level Universal Login branding shows leftover copy from another project on this tenant ("BabyLojo" logo, "PhoenixLife email" placeholder) — customize before any production traffic. (2) "Prompt for Organization" sends users to an org-picker before login; we'll either disable this for the public sign-up flow or pre-create an Organization for each new workspace in L1.

---

## Planned, not yet provisioned

### ⚪ Vercel — Next.js frontend hosting
**Role in the product:** Runs the customer-facing web app. Handles HTTPS, global CDN, automatic preview deployments for every git branch, and edge caching. Whenever a user hits the ObjectFlow URL, Vercel serves them.

**Why not Railway for this too:** Vercel is purpose-built for Next.js — faster cold starts, better caching, automatic image optimization, and previews are first-class. Railway is excellent at long-running services; Vercel is excellent at user-facing pages. Using each for what it's best at.

---

### ✅ Cloudflare R2 — file and document storage
**Role in the product:** Holds anything that isn't a database row — uploaded CSVs/Excel/PDFs, generated exports, AI-produced artifacts, attached files on records. Files get a signed URL the browser uploads to directly, so our servers never have to stream them.

**Why R2 over S3:** Same API as Amazon S3 (drop-in compatible) but no egress fees. When we eventually let customers download large exports or process large files repeatedly, this saves real money. Cloudflare's network is also faster for global distribution.

**What's wired today:** Bucket `objectflow-uploads` in the account, account-level API token with Object Read+Write scope. Worker module `apps/worker/src/storage/r2.ts` exposes `presignUpload`, `presignDownload`, `downloadObject`, `deleteObject`, `objectExists` — all using `@aws-sdk/client-s3` (already pinned) pointed at R2's S3-compatible endpoint. Smoke test verified the full round-trip: presign → browser-style PUT → existence check → presigned GET → server-side download → delete. The browser will use `presignUpload` (via a tRPC procedure in L3) so file bytes never touch our worker memory during upload.

---

### ✅ Inngest — durable workflow orchestrator
**Role in the product:** Runs the multi-step pipelines that string our agents together. When a user uploads a file, the pipeline is: parse → infer schema → wait for human confirmation → ingest → notify. Inngest tracks each step, retries failures automatically, and gives us a UI to see what's happening with every workflow run. If a step fails midway through, the workflow resumes from where it left off instead of starting over.

**Why we need it:** Multi-step AI workflows fail often (rate limits, model timeouts, transient errors). Without Inngest we'd be hand-rolling retry logic, durable state, and observability for every workflow. With it, we describe the workflow as code and Inngest handles the operational concerns.

**What's wired today:** Event Key + Signing Key from Inngest Cloud in env. Local dev server (`inngest-cli@latest dev`) discovers the Fastify worker at `http://localhost:4000/api/inngest` and registers all functions. First function `smoke-test-agent` triggered by `system/smoke.test.requested` — verified end-to-end (event → workflow → agent → Claude → completed run with `agentResponse: "ObjectFlow L0 ready"`).

**Known follow-ups:** Inngest's own Fastify adapter (`inngest/fastify@3.54.2`) is broken — we use the framework-agnostic `inngest/edge` handler bridged into a Fastify route in `apps/worker/src/server.ts`. Working fine; revisit when Inngest fixes their Fastify adapter.

---

### ⚪ Mastra — multi-agent framework
**Role in the product:** Defines what each AI agent in the system *is* — its model, its tools, its memory, its personality. The IngestionAgent, SchemaInferenceAgent, CurationAgent, AssistantAgent, etc. are all Mastra agents. Mastra gives them a common interface so the orchestrator (Inngest) can invoke them uniformly and the AssistantAgent can call other agents as tools.

**Why a framework instead of raw Anthropic SDK calls:** Without one, every agent reinvents memory, tool registration, and conversation state. Mastra handles these once. We still use the Anthropic SDK underneath for the actual model calls.

**Status today:** Installed but not yet adopted — the L0 smoke agent (`runSmokeTestAgent`) uses the raw Anthropic SDK directly. Mastra primitives come in when we build the real agents in L3+ (IngestionAgent, SchemaInferenceAgent, etc.).

---

### ✅ Anthropic — the AI model provider
**Role in the product:** Every agent's brain. Two models in active use:
- **Claude Sonnet 4.6** — default for most agent work (validation, curation suggestions, chat). Fast and cheap enough to run frequently.
- **Claude Opus 4.7** — used for hard reasoning tasks like schema inference from messy uploads. More expensive per call but produces better schemas, which matters because schema errors cascade through everything downstream.

**Why Anthropic over OpenAI/Google:** Claude's tool-use reliability is the best in class right now, which matters when the AssistantAgent is chaining tool calls to other agents. Also: prompt caching support makes long-context agent runs much cheaper.

**What's wired today:** API key in env, account funded with credits. SDK client lives in `packages/agents-core`. First successful call: Claude Sonnet 4.6 returned `"ObjectFlow L0 ready"` from the L0 smoke agent. Model aliases `claude-sonnet-4-6` and `claude-opus-4-7` are set in env, used by every agent that calls into agents-core.

---

### ✅ Langfuse — AI observability
**Role in the product:** Records every AI call the platform makes — which agent called which model with what prompt, how long it took, how much it cost, what tools it invoked, what the user accepted or rejected afterward. Lets us answer "why did the SchemaInferenceAgent get this wrong?" by replaying the exact run.

**Why it matters:** AI quality is impossible to manage without traces. Costs also balloon silently without per-workspace tracking. Langfuse gives us both.

**What's wired today:** US Cloud project `objectFlowStudio` in org `objectFlow`. Tracing is OpenTelemetry-based: the worker initializes `@opentelemetry/sdk-node` with `LangfuseSpanProcessor` from `@langfuse/otel`, plus the OpenInference `AnthropicInstrumentation` that auto-traces every `client.messages.create()` call. The smoke run produced an `Anthropic Messages` generation (model `claude-sonnet-4-6`, 20 input + 9 output tokens) nested under a `smoke-test-agent` span. Every future agent using the Anthropic SDK gets the same auto-instrumentation for free — no agent-level code changes required.

**Setup pattern (follow this for any new worker entry point):** import order in `apps/worker/src/server.ts` matters — `load-env.js` first, `telemetry.js` second, then everything else. The OpenInference patch must be active before any module touches the Anthropic SDK. `shouldExportSpan` is composed with `isDefaultExportSpan` to allowlist OpenInference + our custom `objectflow-worker` tracer while dropping noisy Inngest internals.

---

### ✅ Sentry — error tracking
**Role in the product:** When something throws in production — a TypeScript error, a failed database query, a broken UI render — Sentry captures the stack trace, the user's session, the URL, and any breadcrumbs leading up to it. We get alerted instead of finding out from a customer support ticket.

**Why it matters:** A production bug discovered by a customer costs trust; a production bug discovered by Sentry before any customer sees it is just an engineering task.

**What's wired today:** Two Sentry projects under one org — `objectflow-web` (Next.js) and `objectflow-worker` (Fastify). Web uses Next.js's `instrumentation.ts` register hook plus `onRequestError` for server components / API routes; the next.config.mjs is wrapped with `withSentryConfig` for source-map upload and the `/monitoring` tunnel route (bypasses ad-blockers). Worker init lives at `apps/worker/src/sentry.ts`, imported as the 2nd line of `server.ts` (after env load) so http hooks register before Fastify; a Fastify `setErrorHandler` forwards any uncaught throw to `captureException` with the route as a tag. Both apps tag events with `service: web|worker` for dashboard filtering. CPU profiling skipped — `@sentry/profiling-node` has no prebuilt binary for Node 24 on Windows in 8.55.2.

---

### ✅ Better Stack — log aggregation
**Role in the product:** Collects logs from every running service (web app, worker, background jobs) into one searchable place. When something goes wrong, we can correlate logs from the moment a user clicked a button to the moment a worker failed to process the resulting job.

**Why it matters:** Distributed systems are unobservable without centralized logs. Print statements to console don't survive a server restart, and grepping across 5 services is unworkable.

**What's wired today:** Worker `objectflow-worker` source created on Better Stack (JavaScript integration). Pino transport configured in `apps/worker/src/server.ts` with two targets: stdout for local dev visibility, `@logtail/pino` for shipment. Transport runs in a pino worker thread so shipping never blocks the request loop. Verified live — startup, request lifecycle, and error-level lines all appear in the Better Stack live tail within ~2s. **Follow-up:** create a second source for the Next.js web app and wire it (Next.js doesn't use pino by default — needs its own logger config or middleware).

---

## Local development toolchain (not infrastructure, but worth recording)

### Turborepo + pnpm
Holds all of our code in one repository with multiple sub-projects (web app, worker, shared packages). Lets us share types between the frontend and backend so a backend API change immediately surfaces as a frontend type error.

### Drizzle ORM
The bridge between TypeScript code and Postgres SQL. We describe tables in TypeScript; Drizzle generates SQL migrations and gives us type-safe query building. Chosen over Prisma because our schemas are partially user-defined (each customer creates their own business objects) and Drizzle handles dynamic SQL better than Prisma's code-generated client.

### Next.js
The web app framework. Server-side rendering for fast page loads, React for interactivity, API routes for backend endpoints — all in one project.

### Fastify
The worker service framework. Same role as Next.js's API routes, but optimized for long-running background work rather than user-facing pages.

---

## Quick reference — what each tool is responsible for

| Question | Answer |
|---|---|
| Where does customer data live? | Railway Postgres |
| Where does AI find similar records? | pgvector (inside Postgres) |
| What runs background jobs? | Inngest (orchestration) + Railway Redis (queue) |
| Who decides if you can log in? | Auth0 |
| Who decides what you can do once logged in? | Our backend, checking the JWT Auth0 issued |
| Where do uploaded files go? | Cloudflare R2 |
| What runs the customer-facing app? | Vercel |
| What runs background workers and AI agents? | Railway |
| What model powers the AI agents? | Claude (Anthropic) |
| What ties multi-step AI workflows together? | Inngest |
| What tracks AI agent behavior and cost? | Langfuse |
| What tells us when something breaks? | Sentry (errors) + Better Stack (logs) |
