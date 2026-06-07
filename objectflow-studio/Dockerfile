# Worker service Dockerfile for Railway.
#
# Why a Dockerfile instead of Nixpacks: the Nixpacks Node provider
# hardcodes pnpm install via corepack, which on this Node+pnpm combo
# crashes with ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING. Overriding
# the install phase in nixpacks.toml didn't help — the auto-detected
# `pnpm install --frozen-lockfile` ran anyway, before our override.
# A Dockerfile bypasses all of that.
#
# Build context: objectflow-studio/ (the Railway service Root Directory).
# So all COPY paths are relative to the monorepo workspace root.
#
# Strategy: two stages. Builder installs pnpm via npm (skipping the
# corepack shim entirely), pulls all workspace deps, builds the worker
# bundle via tsup, then runs `pnpm deploy` to create a self-contained
# prod-only bundle. Runtime stage copies just that bundle — no symlinks,
# no devDeps, smallest viable image.

# -----------------------------------------------------------------------------
# Stage 1: builder
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

# pnpm via npm (NOT via corepack — see top comment for why)
RUN npm install -g pnpm@11.5.0

WORKDIR /repo

# Workspace metadata first so Docker can cache the install layer
# across source-only changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/worker/package.json ./apps/worker/
COPY packages ./packages/

# Full workspace install — devDeps included, we need tsup in the
# build phase below.
RUN pnpm install --frozen-lockfile

# Source for the worker (workspace packages were already brought in
# above via packages/).
COPY apps/worker ./apps/worker/

# Tsup bundle: workspace TS deps inlined, runtime deps externalized.
RUN pnpm --filter @objectflow/worker build

# Create a self-contained, symlink-free, prod-only bundle in /deploy.
# This is the pnpm-native way to produce a portable app directory —
# resolves the workspace symlinks into a real directory tree and
# drops devDependencies.
#
# --legacy is required on pnpm v10+ because the new default deploy
# mode wants "inject-workspace-packages=true" (which would physically
# copy workspace .ts source into each consumer's node_modules). We
# already handle that inlining at the tsup layer — workspace TS gets
# bundled into dist/server.js — so we only need pnpm deploy to copy
# external runtime deps. --legacy gives us exactly that behavior.
RUN pnpm deploy --legacy --filter @objectflow/worker --prod /deploy

# -----------------------------------------------------------------------------
# Stage 2: runtime
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runtime

WORKDIR /app

# /deploy from the builder is fully self-contained: dist/, node_modules/,
# package.json. No further install needed.
COPY --from=builder /deploy/dist        ./dist
COPY --from=builder /deploy/node_modules ./node_modules
COPY --from=builder /deploy/package.json ./package.json

ENV NODE_ENV=production

# The worker reads process.env.PORT (Railway injects this dynamically).
# 4000 is the fallback for local Docker runs.
EXPOSE 4000

# Run as the non-root `node` user that the official node images create.
USER node

CMD ["node", "dist/server.js"]
