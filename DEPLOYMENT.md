# Deployment Guide for Vantus Proxy

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL Database
- Redis (for session management and caching)
- OpenTelemetry Collector (optional, for observability)

## Environment Variables

Ensure the following environment variables are set in your `.env` file or deployment environment:

### Global
- `NODE_ENV`: production

### Database
- `DATABASE_URL`: PostgreSQL connection string

### Authentication (Better Auth)
- `BETTER_AUTH_SECRET`: Strong random string
- `NEXT_PUBLIC_BETTER_AUTH_URL`: URL of the control plane (e.g., https://admin.vantus.systems)

### Control Plane
- `CONFIG_RENDERER_SECRET`: Shared secret for communication with Config Renderer
- `CONFIG_RENDERER_URL`: Internal URL of the Config Renderer service
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry collector endpoint

### Config Renderer
- `NGINX_CONF_DIR`: Path to Nginx configuration directory
- `TEMPLATE_DIR`: Path to Nunjucks templates

## Build & Deploy

### 1. Build the Monorepo
```bash
npm install
npm run build
```

### 2. Database Migration
```bash
npx prisma migrate deploy
```

### 3. Start Services

**Control Plane:**
```bash
cd apps/control-plane
npm start
```

**Config Renderer:**
```bash
cd services/config-renderer
npm start
```

## Security

### Content Security Policy (CSP)
The application is configured with strict CSP headers in `next.config.ts`. 
- Scripts are limited to `'self'` and trusted domains.
- Styles are limited to `'self'` and `'unsafe-inline'` (required for some UI libraries).
- Frames are restricted to `SAMEORIGIN`.

### Headers
The following security headers are enforced:
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

## Observability
OpenTelemetry is initialized in `instrumentation.ts`. Ensure your OTLP collector is reachable to receive traces and metrics.
