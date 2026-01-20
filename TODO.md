# Vantus Proxy Control Plane - Roadmap & TODO

## High Priority
- [x] **Authentication Flow**: Implement full user registration, email verification, and password reset flows.
- [x] **RBAC Enforcement**: Ensure UI elements are conditionally rendered based on user roles (Owner, Admin, Viewer).
- [x] **Pagination**: Add server-side pagination for Tenants list and Configuration preview to handle large datasets.
- [x] **Audit Logging**: Hook up `AuditLog` model to all mutation actions (create tenant, deploy config, etc.).

## Core Infrastructure
- [x] **Real Redis Integration**: Replace in-memory Redis simulation in `lib/proxy-control.ts` with real Redis connection for multi-instance support.
- [x] **Nginx Agent**: Build the sidecar agent that runs on Nginx servers to pull configs from this control plane.
- [ ] **Secret Management**: Move secrets (database credentials, NextAuth secret) to a secure vault manager in production.

## Observability & Operations
- [x] **Metrics Ingestion**: Implement API endpoints to receive metrics from Nginx instances (req/sec, latency, error rates) and store in Time Series DB.
- [x] **Alerting**: Setup alerting rules for high error rates or downtime.
- [x] **CI/CD**: Setup GitHub Actions for automated testing and deployment.

## Testing
- [x] **Unit Tests**: Add Jest/Vitest for `lib/nginx-generator.ts` to ensure config correctness.
- [x] **E2E Tests**: Add Playwright tests for critical user flows (Login -> Create Tenant -> Generate Config).
