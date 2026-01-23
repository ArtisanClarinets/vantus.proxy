# Vantus Proxy Platform - Master TODO List

This document tracks the complete roadmap, technical debt, and missing features required to bring the Vantus Proxy Platform to production readiness.

## 🚨 High Priority (Critical Path)

- [ ] **Secret Management & Security Hardening**
    - [ ] Migrate sensitive secrets (database credentials, API keys) from `.env` files to a secure vault (e.g., HashiCorp Vault, AWS Secrets Manager) for production.
    - [ ] Rotate the default `admin@vantus.systems` password immediately in production setup scripts.
    - [ ] Ensure `BETTER_AUTH_SECRET` is generated with high entropy during setup.

- [ ] **Production Authentication Integration**
    - [ ] Replace console log "email sending" in `apps/control-plane/lib/auth.ts` with a real transactional email provider (e.g., Resend, SendGrid, SES).
    - [ ] Implement rate limiting on Auth API endpoints (`/api/auth/*`) to prevent brute force attacks.

- [ ] **Architecture Decoupling (Nginx Agent)**
    - [ ] **Current Issue:** `services/config-renderer` executes `nginx -s reload` directly, requiring it to run in the same container/pod as Nginx (Sidecar pattern).
    - [ ] **Task:** Formalize the "Agent" architecture. Either:
        - A) Document and strictly enforce the Sidecar pattern (easier).
        - B) Decouple into a Control Plane -> Polling Agent model where the Agent runs on the Edge Node and pulls configs from the Renderer.

## 🛠 Core Infrastructure & Backend

- [ ] **Config Generation Consistency**
    - [ ] **Refactor:** The Control Plane currently uses `lib/nginx-generator.ts` (string concatenation) for logic, while the Renderer uses Nunjucks templates (`services/config-renderer`).
    - [ ] **Task:** Consolidate logic. Update Control Plane to call the `config-renderer` service's `/render` endpoint for "Preview" functionality to ensure What-You-See-Is-What-You-Get.
    - [ ] Deprecate `apps/control-plane/lib/nginx-generator.ts`.

- [ ] **Redis Configuration**
    - [ ] Externalize Redis configuration in `apps/control-plane/lib/proxy-control.ts` to support clustered Redis and authentication properly (currently defaults to localhost).

- [ ] **Database & Migrations**
    - [ ] Verify `AuditLog` creation is hooked into all critical mutations (Update Domain, Update Upstream, Change Edge Policy).
    - [ ] Add database indexes for frequently queried fields (e.g., `Tenant.slug`, `Domain.name`) if missing.

## 💻 Control Plane UI (Frontend)

- [ ] **RBAC Verification**
    - [ ] thorough audit of all UI pages to ensure `OWNER`, `ADMIN`, `OPERATOR`, `VIEWER` roles are correctly enforced on buttons/actions (not just API protection).
    - [ ] Hide "Delete Tenant" buttons for non-OWNERs.

- [ ] **UX Improvements**
    - [ ] Add loading states for "Deploy Config" actions.
    - [ ] Improve error handling when Config Renderer service is unreachable.

## 📊 Observability & Monitoring

- [ ] **Alerting Rules**
    - [ ] Define concrete Prometheus/VictoriaMetrics alerting rules for:
        - High 5xx Error Rate (> 1%).
        - High Upstream Latency (> 500ms).
        - Edge Node Offline.
    - [ ] Configure Alertmanager to send notifications (Slack/Email).

- [ ] **Dashboards**
    - [ ] Create a "Tenant Overview" Grafana dashboard template that filters metrics by `tenant_id`.

## ✅ Testing & QA

- [ ] **E2E Test Coverage**
    - [ ] Expand Playwright tests (`tests/e2e`) to cover:
        - Edge Policy configuration (adding headers, IP allowlists).
        - Custom Domain verification flow.
        - Negative test cases (invalid config, unauthorized access).

- [ ] **Unit Testing**
    - [ ] Add unit tests for `services/config-renderer` specifically for Nunjucks template rendering edge cases (e.g., escaping special characters in headers).

## 🚀 DevOps & Deployment

- [ ] **Production Setup**
    - [ ] Update `scripts/install-ubuntu.sh` to include systemd service definitions for `config-renderer` and `control-plane`.
    - [ ] Ensure `docker-compose.prod.yml` exists and is optimized for production (restart policies, resource limits).

---

## Completed Items (Archive)

- [x] **Authentication Flow**: Login, Register, Forgot Password pages.
- [x] **Basic RBAC**: Middleware protection and Schema support.
- [x] **Core Models**: Tenant, Domain, UpstreamPool, EdgePolicy defined in Prisma.
- [x] **Config Renderer Service**: Fastify service with Nunjucks and Rollback logic.
- [x] **Control Plane UI**: Basic dashboard and tenant management.
