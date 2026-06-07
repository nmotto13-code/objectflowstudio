# ObjectFlow Studio — Build Progress

Living tracker. Updated as work lands. Checkboxes are the source of truth; new items get added as they emerge.

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

**Overall status:** L0 done (2026-06-06) — full deploy pipeline verified end-to-end through Anthropic; Langfuse trace export deferred to L1. L1 starts next.

---

## Architecture Snapshot (locked 2026-05-30)

- **Frontend:** Next.js 15 + TS + Tailwind + shadcn/ui on Vercel
- **Backend workers:** Fastify on Railway
- **DB:** Railway Postgres (+ pgvector) + Redis
- **ORM:** Drizzle
- **Auth:** Auth0 Organizations
- **Files:** Cloudflare R2
- **Agents:** Mastra + Inngest + Anthropic SDK (Sonnet 4.6 default, Opus 4.7 for hard reasoning)
- **Observability:** Langfuse + Sentry + Better Stack
- **Repo:** Turborepo + pnpm monorepo at `objectflow-studio/`
- **Base44 export:** kept at `objectflow-export/` as frozen visual reference

---

## L0 — Foundation

**Status:** Done 2026-06-06 — full chain (Vercel → Inngest Cloud → Railway worker → Anthropic) verified live; Langfuse trace export is the one piece that didn't flow through and is documented as the first L1 task.
**Started:** 2026-05-30
**Goal:** Production-grade skeleton — every integration smoke-tested end to end before any feature work.

### Features
- Monorepo + tooling
- Next.js web app deployed
- Fastify worker deployed
- Database with migration runner
- Auth wired
- Background jobs + agent runner wired
- File storage wired
- Observability wired
- CI/CD pipelines

### Tasks
- [x] Create `objectflow-studio/` Turborepo + pnpm workspace (files scaffolded; `pnpm install` blocked on disk space)
- [x] Scaffold `apps/web` (Next.js 15 App Router + TS + Tailwind + shadcn init)
- [x] Scaffold `apps/worker` (Fastify + TS)
- [x] Create `packages/db` with Drizzle + first schema (`_health` table)
- [x] Create `packages/config` with Zod-validated env
- [x] Create `packages/auth`, `packages/trpc`, `packages/events`, `packages/agents-core`, `packages/schema-infer`, `packages/ui` stubs
- [x] Write `.env.example` covering every credential we'll need
- [x] `pnpm install` (892 packages, 10 workspaces, typecheck clean)
- [~] **Provisioning** — done so far: Railway, Auth0. Still to go: Inngest, Langfuse, Sentry, R2, Vercel.
- [x] Connect Drizzle to live Railway Postgres + run health migration (pgvector 0.8.2 confirmed, insert/select round-trip OK)
- [x] Connect to live Railway Redis (PING/PONG, SET/GET OK, Redis 8.2.1)
- [x] Wire Auth0 in `apps/web` (Google sign-in verified end-to-end, protected route renders session claims)
- [ ] Mirror Auth0 Orgs/users/roles into DB on JWT verify
- [x] Wire Inngest (event + signing keys in env, dev server discovers worker, `smoke-test-agent` function registered, framework-agnostic `inngest/edge` handler used after pinning fastify v5 issue)
- [x] Register Inngest workflow that invokes the agent calling Claude — **smoke verified**: `system/smoke.test.requested` → 3s → `{ ok: true, agentResponse: "ObjectFlow L0 ready" }` via Claude Sonnet 4.6
- [x] Wire R2 with signed-upload smoke test (presign PUT → fetch upload → presign GET → fetch download → server-side download → delete; full round-trip in `apps/worker/src/storage/r2.ts` + verify-r2-smoke.ts)
- [x] Wire Sentry in both apps (objectflow-web + objectflow-worker projects; web smoke-test issue captured via Next.js onRequestError; worker via Fastify error handler. Skipped `@sentry/profiling-node` — no Node 24/Windows binary)
- [x] Wire Langfuse for agent traces (OTel auto-instrumentation via `@langfuse/otel` + `@arizeai/openinference-instrumentation-anthropic`; smoke produces `Anthropic Messages` GENERATION with model + tokens nested under `smoke-test-agent` SPAN. Confirmed via Langfuse API on US Cloud)
- [x] Wire Better Stack for logs (`@logtail/pino` transport, multi-target to stdout + Better Stack; verified live in dashboard — startup, request lifecycle, error capture all flowing. Web-side source pending.)
- [x] GitHub Actions CI: install + lint + typecheck + build + test on PR + push-to-main (`.github/workflows/ci.yml`; first run green in 1m 44s on commit `63ad178`; pnpm + turbo caching; concurrency cancels superseded runs)
- [x] Deploy `apps/web` to Vercel — project `ace-creative/objectflow-studio-web`, production live at `https://objectflow-studio-web.vercel.app` (deployment `dpl_DSa4FNRLrh8QdBknGKhssDbeHstp`); 6 routes + 154kB middleware built green on Next.js 15.5.19 (forced upgrade from 15.1.2 — Vercel blocked the older version over CVE-2025-29927). Doppler→Vercel sync covers all 3 environments with 34 app secrets each. Vercel SSO Deployment Protection on (401 to unauth requests is expected). Two carry-overs to L1: split a `prd` Doppler config so Production stops reading dev URLs, and install the Vercel GitHub App so pushes auto-deploy.
- [x] Deploy `apps/worker` to Railway — service `objectflow-worker` in project `objectflow-studio` (alongside Postgres + Redis), public domain `https://objectflow-worker-production.up.railway.app`. Built via multi-stage Dockerfile (Node 22 alpine, `npm install -g pnpm@11.5.0` to bypass corepack's broken pnpm shim, tsup bundles workspace TS into a single `dist/server.js`, `pnpm deploy --legacy --prod /deploy` produces a self-contained prod image, runtime stage runs as `node` user). Doppler→Railway sync mirrors the 34 dev-config secrets. `RAILWAY_ENVIRONMENT`-gated guard in `load-env.ts` strips `INNGEST_DEV` at startup so the SDK runs cloud-mode (signed responses) without breaking local dev. Health: `/health` → 200, `/api/inngest` → 401 to unauth requests (correct cloud-mode behavior), `/health/db` → 200 round-trips to Postgres 18.4. Required four iterations through Nixpacks before pivoting to Dockerfile — full chronology in commit history `08d2409..6fe8e97`.
- [x] End-to-end live smoke verified through Anthropic — `system/smoke.test.requested` fired via the Inngest dashboard, Inngest Cloud signed + delivered the event to Railway, `smoke-test-agent` function ran for 1947ms (the Anthropic Claude Sonnet 4.6 call), returned `{ ok: true, agentResponse: "ObjectFlow L0 ready" }`, status `Completed` in Inngest. Better Stack received every log line. **Langfuse trace did not appear** — telemetry initialized cleanly at boot with correct keys (`pk-lf-61525b05...`) and `https://us.cloud.langfuse.com` base URL, the manual `objectflow-worker` tracer + OpenInference Anthropic instrumentation both registered, but no spans landed in the project (verified empty via both Langfuse API and dashboard UI). Lifted to L1 task `Wire Langfuse trace export through the worker bundle`. Likely root cause: version mismatch between `@arizeai/openinference-instrumentation-anthropic@^0.1.13` and `@anthropic-ai/sdk@^0.100.0`, or OTel SDK/API hoisting under tsup that breaks `manuallyInstrument(Anthropic)` patch timing. Investigation path: pin the Anthropic SDK to whatever range the instrumentation targets, add Langfuse SDK debug logging at trace level, verify spans reach the BatchSpanProcessor by attaching a console-logging processor in parallel.
- [x] L0 summary written

---

## L1 — Workspaces + Users + RBAC + Audit shell

**Status:** Not started
**Goal:** Multi-tenant foundation with enforced server-side authorization and append-only audit log.

### Features
- Workspaces (= Auth0 Orgs)
- User invites + role assignment
- Permissions + scopes
- Audit event write/read
- Authorization middleware

### Tasks
- [ ] DB: `workspaces`, `users`, `org_memberships`, `roles`, `permissions`, `permission_scopes`
- [ ] Auth0 Org → workspace sync job
- [ ] Invite flow (Auth0 invitations API)
- [ ] Role assignment UI
- [ ] Permission matrix UI
- [ ] tRPC authorization middleware (server-side, every procedure)
- [ ] Audit event writer helper + middleware
- [ ] Audit timeline UI (workspace-scoped)
- [ ] Permission scope enforcement on data reads (workspace/object/record)
- [ ] Tests: permission matrix coverage, unauthorized-call rejection, audit coverage on critical actions
- [ ] L1 summary written

---

## L2 — Business Objects (manual builder)

**Status:** Not started
**Goal:** "More advanced than Power BI" manual table builder with versioned schemas and a real records grid.

### Features
- Manual BusinessObject creation
- Full field-type catalog
- Per-field validation rules
- Calculated fields
- Object-to-object relationships
- Schema versioning + migration engine
- Records grid (filter/sort/group/pivot/edit)

### Tasks
- [ ] DB: `business_objects`, `object_schema_versions`, `object_fields`, `object_relationships`, `object_records`
- [ ] Field-type registry: text, long text, number, currency, percent, date, datetime, boolean, single-select, multi-select, email, URL, phone, file, relation, calculated, formula
- [ ] Validation rule engine (required, regex, range, custom expression)
- [ ] Calculated/formula field evaluator (safe expression sandbox)
- [ ] Schema migration engine (add/remove/rename/retype field with backfill)
- [ ] Object builder UI (multi-step + advanced modes)
- [ ] Field builder UI per type
- [ ] Relationship builder (1:1, 1:N, N:N junction)
- [ ] Records grid (TanStack Table: virtualized, filter, sort, group, pivot, inline edit, bulk edit)
- [ ] Record detail drawer + edit form
- [ ] Tests: schema migration round-trips, validation enforcement, calculated-field correctness, grid interactions
- [ ] L2 summary written

---

## L3 — Ingestion + Schema Inference (upload path)

**Status:** Not started
**Goal:** Upload anything → infer schema → confirm → ingest under versioned schema. Re-upload diffs against current version.

### Features
- File upload (R2 signed URL)
- Multi-format parsing
- AI schema inference
- Confirmation UI
- Versioned ingestion with provenance
- Re-upload diff + migration proposals

### Tasks
- [ ] DB: `uploads`, `upload_rows`, `ingestion_runs`, `ingestion_row_results`, `agent_runs`, `agent_run_steps`, `ai_requests`, `ai_generated_artifacts`
- [ ] Parsers: CSV (papaparse stream), Excel (exceljs), JSON
- [ ] IngestionAgent (Mastra) — parse + sample
- [ ] SchemaInferenceAgent (Mastra, Opus 4.7) — type heuristics + LLM pass for naming/relationships/PII flags
- [ ] Inngest workflow: `upload.created` → parse → infer → emit `schema.proposed`
- [ ] Confirmation UI (field-by-field edit, type override, rename, mark PII, add validation)
- [ ] On confirm: lock `object_schema_version`, ingest rows with provenance (`source_upload_id`, `source_row_number`, `inferred_by_agent_run_id`)
- [ ] Re-upload: diff against current version, propose migration plan
- [ ] Parser extensions: PDF (text via pdf-parse, fallback to Claude vision), image OCR
- [ ] Agent eval suite — golden uploads with expected schemas, grading harness
- [ ] Tests: parser correctness, inference quality, schema-diff correctness, provenance integrity
- [ ] L3 summary written

---

## L4 — Forms + Intake

**Status:** Not started
**Goal:** Forms generated from object schemas with conditional logic; intake records carry raw + mapped payloads.

### Features
- Form builder from object schema
- Public + internal form rendering
- Conditional logic + sections
- Intake record pipeline
- ValidationAgent on submission

### Tasks
- [ ] DB: `forms`, `form_fields`, `form_code_blocks`, `intake_sources`, `intake_records`, `validation_results`
- [ ] Form builder UI (Basic/Advanced/Code modes from Base44 reference)
- [ ] Field mapping form→object
- [ ] Conditional visibility rules
- [ ] Custom JS code blocks (sandboxed, treated as untrusted)
- [ ] Public form renderer (no auth)
- [ ] Internal form renderer
- [ ] Submit pipeline: raw_payload → ValidationAgent → mapped_payload → intake_record
- [ ] Inngest workflow: `intake.submitted` → validate → enqueue for curation
- [ ] Tests: form submission e2e, validation coverage, sandboxing of custom JS
- [ ] L4 summary written

---

## L5 — Curation Queue

**Status:** Not started
**Goal:** Review-before-trust workflow with duplicate detection and bulk operations.

### Features
- Queue UI with filters
- Review drawer (raw/mapped diff, validation, AI suggestions)
- CurationAgent (duplicates via pgvector, enrichment)
- Approve → CuratedRecord
- Reject with trail
- Bulk operations

### Tasks
- [ ] DB: `curated_records` + provenance back to `intake_records`
- [ ] pgvector setup + embedding generation on intake
- [ ] CurationAgent: similarity search, record diff, enrichment suggestions
- [ ] Queue UI with status filters
- [ ] Review drawer (raw/mapped tabs, validation pills, duplicate match panel)
- [ ] Approve action → write CuratedRecord + AuditEvent + emit `record.curated`
- [ ] Reject action with reason + AuditEvent
- [ ] Bulk approve/reject
- [ ] Records page (curated records, browse, search, filter)
- [ ] Record audit timeline
- [ ] Tests: approval/reject flows, duplicate-detection eval, bulk safety, audit coverage
- [ ] L5 summary written

---

## L6 — Processes + Stages

**Status:** Not started
**Goal:** Records flow through configurable process stages with SLAs and assignees.

### Features
- Process definitions per object
- Stage transitions
- Assignees + SLAs
- ProcessInstance tracking
- History view

### Tasks
- [ ] DB: `processes`, `process_stages`, `process_transitions`, `process_instances`, `process_instance_history`, `tasks`
- [ ] Process builder UI (stage cards from Base44 reference)
- [ ] Transition rules (manual, conditional, scheduled)
- [ ] Assignee resolution (user, role, dynamic)
- [ ] SLA timer + breach events
- [ ] Process instance state machine
- [ ] Process detail panel + history timeline
- [ ] Tests: state-machine correctness, SLA breach firing, transition guards
- [ ] L6 summary written

---

## L7 — Automations

**Status:** Not started
**Goal:** Rule-based trigger→action engine with AI-suggested rules and dry-run safety.

### Features
- Rule builder UI
- Trigger + condition + action model
- Action library
- AutomationAgent suggestions
- Run log + dry-run mode

### Tasks
- [ ] DB: `automation_rules`, `automation_runs`, `automation_logs`, `notifications`
- [ ] Trigger registry (record.curated, record.updated, stage.entered, sla.breached, scheduled, webhook.received)
- [ ] Condition evaluator (JSONLogic-style)
- [ ] Action library (webhook, email via Resend, task creation, record update, slack/teams later)
- [ ] Rule builder UI
- [ ] Dry-run executor
- [ ] AutomationAgent — mine audit history for suggestions
- [ ] Run log UI with replay
- [ ] Tests: rule execution, dry-run safety, idempotency, action permissions
- [ ] L7 summary written

---

## L8 — Integrations

**Status:** Not started
**Goal:** Inbound/outbound integration primitives + connector framework.

### Features
- Inbound API ingest
- Webhook receivers (HMAC verified)
- Outbound webhook + email
- Connector framework scaffold

### Tasks
- [ ] DB: `integrations`, `integration_credentials` (encrypted), `integration_mappings`, `integration_runs`, `integration_errors`
- [ ] API key generation + scoping for inbound
- [ ] Webhook receiver endpoint with HMAC verification
- [ ] Outbound webhook fire with retry + signing
- [ ] Email send (Resend or Postmark)
- [ ] Connector framework interface (auth, sync, map)
- [ ] Stub connectors: HTTP webhook, generic API
- [ ] Integration UI (cards + detail from Base44 reference)
- [ ] Tests: HMAC validation, retry/backoff, credential encryption-at-rest
- [ ] L8 summary written

---

## L9 — Insights / Dashboards

**Status:** Not started
**Goal:** Pivot/aggregate UI over records with charts and saved views.

### Features
- Pivot/aggregate builder
- KPI cards
- Charts (Recharts)
- Saved views
- Scheduled exports

### Tasks
- [ ] Aggregate query builder over JSONB
- [ ] Dashboard composer UI
- [ ] KPI card component
- [ ] Chart components (line, bar, pie, area, funnel)
- [ ] Saved view persistence + sharing
- [ ] Scheduled CSV/Excel export via Inngest cron
- [ ] Tests: aggregate correctness on JSONB, scheduled export delivery
- [ ] L9 summary written

---

## L10 — AI Assistant (cross-cutting)

**Status:** Not started · lights up progressively from L2 onward
**Goal:** Persistent assistant panel that routes to every other agent as tools; suggestion→draft→accept everywhere.

### Features
- Persistent chat panel
- Agent-as-tool routing
- Draft/accept/reject UI everywhere
- Run trace UI
- Permission-aware tool access

### Tasks
- [ ] AssistantAgent (Mastra) with all other agents wrapped as tools
- [ ] Chat panel UI (persistent in app shell)
- [ ] Conversation persistence
- [ ] Tool-use streaming UI
- [ ] Draft artifact UI (schema drafts, automation drafts, record edits)
- [ ] Accept/reject flow with audit event
- [ ] Agent run trace viewer (steps + costs + Langfuse link)
- [ ] Per-workspace cost tracking + budgets
- [ ] Tests: assistant eval suite, permission enforcement on tools, PII masking
- [ ] L10 summary written

---

## Cross-cutting concerns (tracked separately, applied per layer)

- [ ] Type safety end-to-end (Zod at boundaries, tRPC inference, Drizzle types)
- [ ] All agent outputs are draft-only until human approval
- [ ] Server-side authorization on every mutation
- [ ] Audit events for every critical action
- [ ] Cost tracking per workspace for LLM usage
- [ ] PII masking in agent contexts
- [ ] Playwright e2e suite grows with each layer
- [ ] Agent eval suite grows with each layer
- [ ] Docs updated per layer (API reference, agent reference, ops runbook)

---

## Newly discovered tasks (added as work proceeds)

- [x] **Free disk space on C:** done 2026-05-30 by deleting `C:\Users\blued\StrainProto`; freed to 9.1 GB available.

### L0 → L1 carry-overs (priority for early L1)

- [x] **Wire Langfuse trace export through the worker bundle.** Resolved 2026-06-07. Real root cause was a Sentry-vs-Langfuse OTel TracerProvider conflict — `@sentry/node` v8 auto-registers its own global TracerProvider during `Sentry.init()`, which OTel's API treats as final. Our subsequent `provider.register()` call was a silent no-op; every span we created routed to Sentry's processor, none to Langfuse. Fix: pass `skipOpenTelemetrySetup: true` to `Sentry.init()` in `apps/worker/src/sentry.ts`, and use direct `NodeTracerProvider({ spanProcessors })` registration in `telemetry.ts` (skips `sdk-node`'s auto-config layer). Verified end-to-end live — smoke event from Inngest dashboard produced trace `c6217ca39054cdca8857cbbc977a671e` in `objectFlowStudio`: `smoke-test-agent` SPAN containing `Anthropic Messages` GENERATION (claude-sonnet-4-6, 20 prompt + 9 completion tokens, $0.000195, 1.46s latency). Diagnostic chronology in commit history `9bfad4a..1c33106`.
- [ ] **Split `prd` Doppler config and re-point production syncs.** Both Vercel Production and Railway production currently read the `dev` Doppler config — that's why the worker had `INNGEST_DEV=1` in production and we patched it via `RAILWAY_ENVIRONMENT` guard, and why the Vercel-deployed Next.js still has `APP_BASE_URL=http://localhost:3000` so its Auth0 flow can't complete against the deployed host. Create a `prd` Doppler config with production URLs + production Auth0 tenant + production Railway DB (or reuse current Railway DB for L1 since we don't have separate prod data yet), then update the three Doppler→Vercel syncs (Production-targeted ones) and the one Doppler→Railway sync to source from `prd`. The `RAILWAY_ENVIRONMENT` guard in `load-env.ts` becomes a no-op and can be removed.
- [ ] **Install Vercel GitHub App on `nmotto13-code`.** `vercel git connect` failed because the app isn't installed on the account — until it is, Vercel deploys must run via `vercel deploy --prod` from local. Manual one-click install through Vercel's GitHub integration page, then `vercel git connect` succeeds and pushes auto-deploy. Symmetrical to Railway, which already auto-deploys on push because Railway's GitHub App was set up during service creation.
- [ ] **Wire a Better Stack source for the Next.js web app.** Worker logs flow to Better Stack via `@logtail/pino`; the web app doesn't ship logs anywhere yet. Needs its own source and a Next.js-side logger (Pino isn't built-in to Next; could use a middleware-based logger or just structured `console` + the Vercel log-drain pattern).
- [ ] **Re-test Auth0 login against the Vercel-deployed app once `prd` Doppler split lands.** L0 added the Vercel URLs to Auth0's Allowed Callback/Logout/Web Origins, but Auth0 SDK in the deployed app calculates the callback URL from `APP_BASE_URL` env which currently points at localhost — so the flow can't actually complete end-to-end from a browser hitting the Vercel domain. Resolves when the Doppler split above lands and `APP_BASE_URL` becomes the Vercel URL in production.

---

## Decision log

- **2026-05-30** — Stack locked: Next.js/Vercel + Fastify/Railway + Postgres/Redis + Drizzle + Auth0 + Mastra/Inngest/Anthropic. See `memory/project_stack_decisions.md`.
- **2026-05-30** — Schema model: versioned `object_schema_versions` with provenance on every record. "Power BI but more advanced."
- **2026-05-30** — Base44 export kept as sibling reference, not touched.
- **2026-05-30** — Monorepo: Turborepo + pnpm.
- **2026-05-30** — Execution cadence: drive L0 end-to-end after agent/path confirmation; provisioning pause mid-L0 for credentials.
