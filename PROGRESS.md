# ObjectFlow Studio — Build Progress

Living tracker. Updated as work lands. Checkboxes are the source of truth; new items get added as they emerge.

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

**Overall status:** L0 in progress

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

**Status:** In progress (started 2026-05-30)
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
- [ ] Wire Inngest (signing key, dev server, deploy endpoint)
- [ ] Register one noop Inngest workflow that invokes a Mastra agent calling Claude — smoke test
- [ ] Wire R2 with signed-upload smoke test
- [ ] Wire Sentry in both apps
- [ ] Wire Langfuse for agent traces
- [ ] Wire Better Stack (or Axiom) for logs
- [ ] GitHub Actions CI: install + lint + typecheck + test on PR
- [ ] Deploy `apps/web` to Vercel
- [ ] Deploy `apps/worker` to Railway
- [ ] End-to-end live smoke: hit Vercel URL → login → trigger Inngest workflow on Railway → agent call → Langfuse trace appears
- [ ] L0 summary written

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

---

## Decision log

- **2026-05-30** — Stack locked: Next.js/Vercel + Fastify/Railway + Postgres/Redis + Drizzle + Auth0 + Mastra/Inngest/Anthropic. See `memory/project_stack_decisions.md`.
- **2026-05-30** — Schema model: versioned `object_schema_versions` with provenance on every record. "Power BI but more advanced."
- **2026-05-30** — Base44 export kept as sibling reference, not touched.
- **2026-05-30** — Monorepo: Turborepo + pnpm.
- **2026-05-30** — Execution cadence: drive L0 end-to-end after agent/path confirmation; provisioning pause mid-L0 for credentials.
