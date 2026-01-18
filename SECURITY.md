# Security Architecture

## Threat Model
*   **Edge**: Nginx acts as the primary ingress. Host headers are strictly validated.
*   **Control Plane**: RBAC is enforced at the Application layer (Next.js) and Data layer (Prisma).
*   **Config Injection**: The Config Renderer Service validates all inputs before generating Nginx configuration. Nginx configuration is validated with `nginx -t` before reload.

## Secrets Handling
*   All secrets are managed via Environment Variables.
*   `.env` files are excluded from version control.
*   In production, use a Secret Manager (e.g., AWS Secrets Manager, Vault).

## Logging & Auditing
*   **Audit Logs**: Critical actions (Tenant creation, Policy updates, User changes) are recorded in the `AuditLog` database table.
*   **Access Logs**: Nginx produces structured JSON logs containing `tenant_id`.
*   **Observability**: Vector collects logs and forwards them to Loki for tamper-evident storage (if configured with immutability).

## GDPR & Compliance
*   **Data Export**: `/api/gdpr/export` allows exporting user data.
*   **Data Deletion**: `/api/gdpr/delete` performs a hard delete of user PII.
