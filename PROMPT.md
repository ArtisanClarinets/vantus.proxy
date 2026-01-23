### Role

You are a **senior full-stack/infra engineer** shipping a production-ready **Next.js 16 control plane** + **Fastify config-renderer** + **Nginx edge** stack inside a npm monorepo. You have full system access and can edit, add, delete files and run commands.

---

# Objective

Implement **all production-readiness fixes** and **all 5 new features** described in the provided context. The end result must:

1. **Build cleanly** (`npm -r build`)
2. **Typecheck cleanly** (`npm -r lint` + `npm -r test` + a new root `typecheck`)
3. Run via Docker compose with correct health checks
4. Have **secure config deployment** (config-renderer locked down; deploy surface not browser-exposed)
5. Include **diff/rollback**, **edge fleet**, **SSO+MFA**, **tenant observability UI**, and **API tokens + public API**
6. E2E smoke test must pass in CI and locally

Deliver changes as a single cohesive implementation (you may create multiple commits locally, but final output must be complete).

---

# Global Constraints / Standards

* **Next.js 16.1.3** App Router
* Node: **>=20.9** everywhere
* TypeScript: **>=5.1**
* Use **Better Auth** everywhere; remove NextAuth remnants entirely
* Use **Route Handlers** as BFF for any internal services (config-renderer) and for public API endpoints
* No secrets in `NEXT_PUBLIC_*`
* Add **Zod** validation on all Route Handlers that accept input
* Add structured logging and audit logging
* Security-by-default: auth, rate limiting, least privilege, no public internal ports

---

# Phase 0 — Quick Recon (must do first)

1. `cd /mnt/data/vantus.proxy-main/vantus.proxy-main`
2. Inspect current workspace with:

   * `npm -v`
   * `node -v`
   * `npm -r list --depth 0`
3. Run baseline checks (expect failures; capture them mentally):

   * `npm install --frozen-lockfile`
   * `npm -r build`
   * `npm -r lint`
   * `npm -r test`

Fix until all succeed.

---

# Phase 1 — Repo-Wide Production Baseline

## 1. Root `package.json`

Modify **`package.json` (root)**:

* Set:

  * `engines.node` → `>=20.9`
  * `devDependencies.typescript` → `^5.1.0` (or current stable, but >=5.1)
* Add:

  * `packageManager` field pinned to npm version used in lockfile (infer from `package-lock.yaml`)
  * New scripts:

    * `typecheck`: `npm -r typecheck` (create per package where needed) OR `tsc -b` if you implement project refs
    * Ensure CI calls lint/test/build explicitly

## 2. CI Workflow

Create **`.github/workflows/ci.yml`**:

* Use `actions/setup-node` Node 20
* `corepack enable`
* `npm install --frozen-lockfile`
* `npm -r lint`
* `npm -r test`
* `npm -r build`
* Build Docker images for at least:

  * `apps/control-plane`
  * `services/config-renderer`
* Run Playwright e2e smoke test (either separate job or after bringing up docker compose)
* Cache npm store

## 3. Docs

Update:

* **`README.md`**

  * Fix env instructions to match reality
  * Add production deployment steps: migrations, secrets, TLS, config-renderer auth model
* **`SECURITY.md`**

  * Add threat model: config-renderer, audit log integrity, secrets handling, tenant isolation boundaries

---

# Phase 2 — Control Plane (Next.js) Fixes

## 2.1 Next standalone + Docker correctness

### Modify `apps/control-plane/next.config.ts`

Add:

* `output: 'standalone'`
* `outputFileTracingRoot` set to monorepo root (resolve absolute path)
* Optionally `serverExternalPackages: ['@prisma/client']` if bundling complains

### Modify `apps/control-plane/Dockerfile`

Harden:

* Keep standalone copy steps (after config change)
* Add non-root user in runner stage
* Add `HEALTHCHECK` hitting `/system/health`
* Ensure env vars are runtime-provided, not baked

## 2.2 Proxy: keep minimal + aligned with Next 16

### Modify `apps/control-plane/proxy.ts`

* Stop doing “full auth” or slow fetch loops inside proxy
* Limit matcher to only what you truly want gated (default):

  * `/app/:path*`
  * optionally `/system/:path*` if appropriate
* Remove `/tenant` parsing logic unless it exists in routes
* Do not inject `x-user-id` as security boundary

**Goal:** proxy is a light gate/redirect, not auth system.

## 2.3 Auth cleanup: remove NextAuth entirely

### Delete

* **`apps/control-plane/app/api/auth/[...nextauth]/route.ts`** (broken and unused)

### Fix components using next-auth

Modify:

* **`apps/control-plane/components/Providers.tsx`**

  * Remove `next-auth/react` `SessionProvider`
  * Replace with either:

    * no provider at all, OR
    * a lightweight React Query provider (if needed) + optional Better Auth session hook usage
* **`apps/control-plane/components/AppSidebar.tsx`**

  * Replace `signOut()` from NextAuth with Better Auth:

    * `await authClient.signOut()` then route to `/auth/login`

### Create logout route

Create:

* **`apps/control-plane/app/auth/logout/page.tsx`**

  * Client component that signs out via Better Auth and redirects to `/auth/login`

## 2.4 Replace header-based auth in server actions/helpers

### Modify `apps/control-plane/lib/actions.ts`

* Replace `x-user-id` logic with Better Auth server session:

  * `const session = await auth.api.getSession({ headers: await headers() })`
* Add helpers:

  * `requireAuth()`
  * `requireRole(roles: Role[])`
  * `requireTenantAccess(tenantId: string, allowedRoles: Role[])`
* Ensure tenant membership verification is enforced at:

  * `/app/**` layout boundary
  * `/app/tenants/[tenantId]/**` layout boundary
* Add consistent audit log enrichment: ip, user-agent, tenantId, actorId

### Modify:

* `apps/control-plane/app/page.tsx`: stop sniffing cookie names; use session retrieval and redirect
* `apps/control-plane/app/app/layout.tsx`: enforce auth boundary here
* `apps/control-plane/app/app/users/page.tsx`: OWNER/ADMIN only, pagination
* `apps/control-plane/app/app/audit/logs/page.tsx`: OWNER/ADMIN only, pagination + filters
* `apps/control-plane/app/app/tenants/page.tsx`: list only user’s tenants unless privileged
* `apps/control-plane/app/app/tenants/[tenantId]/layout.tsx`: enforce membership via `requireTenantAccess`

---

# Phase 3 — Fix Nginx Preview/Deploy Path: BFF + secure renderer

## 3.1 Remove broken internal generator

Delete:

* **`apps/control-plane/lib/nginx-generator.ts`** (if it exists; verify; your plan says delete)

## 3.2 Build BFF layer in control-plane

Create:

* **`apps/control-plane/lib/config-renderer-client.ts`**

  * Functions:

    * `renderTenantConfig(tenantId)`
    * `deployTenantConfig(tenantId, options?)`
    * `getCurrentTenantConfig(tenantId)`
    * `rollbackTenantConfig(tenantId, deploymentId)`
  * Inject internal auth header:

    * `Authorization: Bearer ${process.env.CONFIG_RENDERER_SECRET}`
  * Add timeouts, structured error mapping

Create Route Handlers:

* **`apps/control-plane/app/api/nginx/render/route.ts`**
* **`apps/control-plane/app/api/nginx/deploy/route.ts`**
* Also for feature #1:

  * **`/api/nginx/current`** (or similar)
  * **`/api/nginx/rollback`**

All must:

* Validate session + role (OWNER/ADMIN/OPERATOR)
* Validate request with Zod
* Call renderer via `config-renderer-client`
* Record deployment history in DB (or coordinate if renderer writes it—choose one canonical writer and keep consistent)

## 3.3 Rewire UI to call BFF, not renderer directly

Modify:

* **`apps/control-plane/components/DeployButton.tsx`**

  * Remove any `NEXT_PUBLIC_CONFIG_RENDERER_URL`
  * Call `/api/nginx/deploy`
* **`apps/control-plane/app/app/nginx/render-preview/page.tsx`**

  * Stop importing broken generator
  * Call BFF server-side route (or directly call `config-renderer-client` from server component)
* **`apps/control-plane/app/app/nginx/actions.ts`**

  * Replace mock deploys and wrong Prisma models with real deploy calls + correct `deploymentHistory`

---

# Phase 4 — Config Renderer Service Hardening (Fastify)

## 4.1 Lock down endpoints

Modify **`services/config-renderer/src/index.ts`**:

* Add:

  * Auth requirement on `/render`, `/deploy`, `/current`, `/rollback`:

    * `Authorization: Bearer ${CONFIG_RENDERER_SECRET}`
* Remove permissive CORS:

  * If only server-to-server: disable CORS or restrict to internal origins
* Add rate limiting for deploy endpoints
* Add `/health` endpoint

## 4.2 Create service modules

Create:

* **`services/config-renderer/src/env.ts`** (Zod env schema, fail fast)
* **`services/config-renderer/src/auth.ts`** (`assertAuthorized(req)` → 401)
* **`services/config-renderer/src/nginx.ts`**

  * `writeTenantConfAtomically()`: temp file → `nginx -t` → atomic rename → reload
  * `testConfig()`, `reload()`
  * Keep last-known-good config for rollback
* Ensure safe log handling:

  * redact secrets
  * truncate logs

## 4.3 Deployment history recording

Ensure on deploy:

* Create `DeploymentHistory` records with `PENDING/SUCCESS/FAILED`
* Store:

  * timestamps
  * rendered config snapshot or reference (prefer snapshot for diff/rollback feature)
  * deploy logs (truncated)

Update **`services/config-renderer/package.json`**:

* Add deps:

  * `@fastify/helmet`
  * `@fastify/rate-limit`
  * (Fastify already uses pino; add `pino-pretty` only for dev if desired)

Update **`services/config-renderer/Dockerfile`**:

* non-root where possible
* healthcheck `/health`
* prod deps only (multi-stage)

---

# Phase 5 — Database Migrations Discipline

## 5.1 Replace db push with migrate deploy

Modify:

* **`database/Dockerfile`**:

  * replace `prisma db push` with `prisma migrate deploy`
  * seed only when `SEED=true` or non-prod

Create/commit:

* **`database/prisma/migrations/**`**

  * Generate initial migration from schema
  * Ensure reproducible

Modify:

* **`database/package.json`** scripts:

  * `migrate:dev`, `migrate:deploy`, `seed`, optional `studio`

Modify:

* **`database/seed/seed.ts`**

  * Remove hardcoded `password123`
  * Require `INITIAL_ADMIN_PASSWORD` (and fail hard in production)
  * Keep seed idempotent

---

# Phase 6 — Infra / Docker / Nginx Templates

## 6.1 Compose hardening

Modify **`infra/docker/docker-compose.yml`**:

* Pin all `latest` images to specific versions
* Remove public port exposure for config-renderer (`3001`) — keep internal only
* Add healthchecks for:

  * mysql/mariadb
  * control-plane
  * config-renderer
  * nginx
* Add restart policies and basic resource limits
* Fix mounts that reference missing directories (create them or remove)

Create:

* **`infra/docker/.env.example`** with all required vars (DB, Better Auth, renderer secret, base domain, observability)
* **`infra/docker/docker-compose.prod.yml`** (or override) with:

  * no internal ports exposed
  * TLS mount strategy
  * HTTPS termination decisions

## 6.2 Nginx template fixes

Modify:

* **`infra/nginx/templates/nginx.conf.njk`**

  * log `tenant_id` from `$tenant_id` variable, not `$sent_http_x_tenant_id`
* **`infra/nginx/templates/tenant.server.conf.njk`**

  * set `set $tenant_id "{{ tenantId }}";`
  * enable security headers include
  * implement rate limiting and allowlist from `edgePolicy`
  * optional TLS and HTTP→HTTPS redirects if desired

Create:

* **`infra/nginx/snippets/security_headers.conf`**

  * HSTS (only when TLS)
  * X-Content-Type-Options, X-Frame-Options, Referrer-Policy, etc.
  * conservative CSP baseline

---

# Phase 7 — Instrumentation (Next.js 16 compliant)

Modify:

* **`apps/control-plane/instrumentation.ts`**

  * Keep node runtime guard pattern
* **`apps/control-plane/instrumentation.node.ts`**

  * Replace custom NodeSDK wiring with `@vercel/otel` registration (per Next docs)
    Update:
* **`apps/control-plane/package.json`**

  * Add `@vercel/otel`
  * Remove unused deps left behind after NextAuth removal

---

# Phase 8 — Tests must be meaningful + passing

Modify:

* **`tests/e2e/smoke.spec.ts`**

  * Replace “Get started” assertion with:

    * `/system/health` returns 200
    * `/auth/login` shows login UI
    * Optionally: login via seed user then confirm `/app/dashboard` loads

Modify:

* **`playwright.config.ts`**

  * `baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'`

Add/adjust unit tests as needed for:

* config-renderer auth
* rollback/diff APIs
* API token scopes enforcement

---

# Phase 9 — Implement the 5 New Features (All Required)

## Feature 1) Config diffs + one-click rollback

Implement:

* Control plane UI pages:

  * `apps/control-plane/app/app/tenants/[tenantId]/deployments/page.tsx` (list history)
  * `apps/control-plane/app/app/tenants/[tenantId]/deployments/[deploymentId]/page.tsx` (diff + rollback)
* Create component:

  * `apps/control-plane/components/ConfigDiffViewer.tsx`
* Renderer endpoints:

  * `/current` returns current deployed config snapshot
  * `/rollback` rollback to specified deployment ID (atomic + nginx -t + reload)
* DB:

  * Ensure `DeploymentHistory` stores config snapshot (or reference) sufficient for diff/rollback
* Diff:

  * Use a robust diff library or implement line-based diff with syntax highlighting

## Feature 2) Edge fleet management (multiple Nginx edges)

Implement models:

* `EdgeCluster`, `EdgeNode`, `TenantEdgeAssignment` in Prisma schema + migrations
  UI:
* `apps/control-plane/app/app/edges/page.tsx` CRUD
  Renderer:
* Accept target edge(s) on deploy (or publish jobs to queue; simplest: deploy per edge node synchronously with health checks)
  Infra:
* Update docker compose to spin multiple nginx containers to simulate fleet

## Feature 3) SSO + MFA for control plane admins

Auth:

* Extend `apps/control-plane/lib/auth.ts` with social providers (GitHub/Google)
  UI:
* `apps/control-plane/app/auth/login/page.tsx` adds SSO buttons
  Security settings page:
* `apps/control-plane/app/app/settings/security/page.tsx` to manage MFA
  DB:
* Add tables if Better Auth plugins require them; implement migrations

## Feature 4) Tenant observability dashboards inside control plane

UI page:

* `apps/control-plane/app/app/tenants/[tenantId]/observability/page.tsx`
  Dashboards:
* Add Grafana provisioning JSON dashboards under:

  * `observability/grafana/provisioning/dashboards/*.json`
    Datasource:
* Update provisioning if needed
  Nginx:
* Ensure tenant id consistently emitted (`$tenant_id`) for logs/metrics correlation

## Feature 5) API tokens + public management API (Terraform-ready)

DB:

* Add `ApiToken` model (scopes, expiry, hashed token, tenant association)
  UI:
* `apps/control-plane/app/app/settings/api-tokens/page.tsx` create/revoke tokens
  Public API:
* Implement `apps/control-plane/app/api/v1/**/route.ts` for:

  * tenants, domains, policies, etc. (at least CRUD essentials)
    Security:
* Token auth middleware/helper:

  * bearer token → hash compare → scope check → tenant access
* Rate limiting + audit log for every write
  Proxy matcher updated to protect these APIs as needed (or enforce in handler)

---

# Final Acceptance Criteria (Must Pass)

After implementation, ALL must succeed:

### Local commands

* `npm install --frozen-lockfile`
* `npm -r lint`
* `npm -r test`
* `npm -r build`
* `npm typecheck` (new)
* `docker compose -f infra/docker/docker-compose.yml up --build` starts cleanly
* Health checks:

  * control-plane: `GET /system/health` → 200
  * config-renderer: `GET /health` → 200
* Security:

  * config-renderer `/deploy` and `/render` reject requests without bearer token
  * control-plane no longer uses `NEXT_PUBLIC_CONFIG_RENDERER_URL`
  * NextAuth code fully removed; no `next-auth` dependency required
* E2E:

  * `npm --filter tests test` (or equivalent) passes

### Security invariants

* No internal service secrets exposed to browser
* Tenant pages enforce membership in layout
* Audit log records actor + tenant + action on all writes
* API tokens stored hashed, never plaintext; scopes enforced

---

# Output Requirements

When done, provide:

1. A concise summary of key changes
2. A file list of created/modified/deleted files
3. Exact commands to run locally and in CI
4. Any env vars added (and update `.env.example` accordingly)

---

## Notes on Known Repo Reality (use these facts)

* Root Node engine currently `>=18` and TS `^5.0.0` → must update
* `apps/control-plane/next.config.ts` currently lacks `output: 'standalone'` but Dockerfile copies `.next/standalone`
* `apps/control-plane/components/Providers.tsx` and `AppSidebar.tsx` currently import `next-auth/react` → must remove
* There is a broken NextAuth route at `apps/control-plane/app/api/auth/[...nextauth]/route.ts` → delete
* `apps/control-plane/proxy.ts` currently fetches `/api/auth/get-session` and injects headers → simplify
* `services/config-renderer/src/index.ts` currently has permissive CORS and no auth → lock down + add atomic deploy

---

If you need to choose between alternative implementations, prioritize:

1. security + correctness, 2) reproducibility, 3) simplicity, 4) performance.

Proceed end-to-end in one run.
