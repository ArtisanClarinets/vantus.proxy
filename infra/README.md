# Infrastructure

This directory contains the Infrastructure-as-Code (IaC) and configuration files for deploying the Vantus Proxy Platform.

## Directory Structure

*   **`docker/`**: Docker Compose configurations.
    *   `docker-compose.yml`: (Legacy/Reference) The root `docker-compose.yml` is now the primary entry point.
*   **`nginx/`**: Nginx configuration templates and snippets.
    *   `templates/`: Nunjucks templates used by the Config Renderer.
    *   `snippets/`: Reusable Nginx configuration snippets (e.g., SSL settings, proxy headers).
*   **`observability/`**: Configurations for the observability stack.
    *   `grafana/`: Dashboards and datasources.
    *   `loki/`: Log aggregation config.
    *   `otel-collector/`: OpenTelemetry Collector pipeline.
    *   `vector/`: Vector log collector config.

## Deployment

### Docker Compose (Recommended)

The entire stack is orchestrated via the root `docker-compose.yml`.

```bash
docker-compose up -d
```

### Baremetal (Ubuntu 22.04)

See `scripts/install-ubuntu.sh` in the root directory for a complete baremetal installation script.
