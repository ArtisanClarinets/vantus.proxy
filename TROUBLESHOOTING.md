# Troubleshooting Guide

## Common Issues

### 1. Orchestrator Fails to Start
**Error:** `Address already in use`
**Solution:** The requested port is occupied. The orchestrator attempts to find the next available port, but if you forced a port that is busy or if the OS blocks it, try a different port:
```bash
npm start -- --port 4000
```

### 2. Config Renderer Not Reachable
**Error:** `Upstream error: Connection refused` in Control Plane logs.
**Solution:**
- Ensure `config-renderer` service is running.
- Check if `CONFIG_RENDERER_URL` environment variable in `control-plane` matches the port `config-renderer` is listening on.
- The Orchestrator sets this automatically, but manual runs might miss it.

### 3. Database Connection Errors
**Error:** `P1001: Can't reach database server`
**Solution:**
- Verify PostgreSQL is running.
- Check `DATABASE_URL` in `.env`.
- Ensure network connectivity (if running in Docker/K8s).

### 4. Authentication Failures
**Error:** `Auth check failed` in logs or 401 redirects.
**Solution:**
- Check `BETTER_AUTH_SECRET` and `NEXT_PUBLIC_BETTER_AUTH_URL`.
- Ensure cookies are being passed correctly if using a custom client.
- Verify `proxy.ts` logic is not blocking valid requests.

## Logging & Monitoring

- **Logs:** Application logs are piped to stdout. In production, these should be collected by a log aggregator (e.g., ELK, Datadog).
- **Metrics:** `/api/metrics` endpoint accepts OpenTelemetry metrics.
- **Tracing:** OpenTelemetry is enabled. Check `instrumentation.ts` config.

## Support

For critical issues, contact the Platform Engineering team at support@vantus.systems.
