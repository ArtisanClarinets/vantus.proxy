# Vantus Proxy

Enterprise-grade Nginx Control Plane & Proxy with multi-tenancy, RBAC, and observability.

## Quick Start

1.  **Prerequisites**: Docker & Docker Compose.

2.  **Start the Platform**:
    ```bash
    cd infra/docker
    cp .env.example .env
    docker compose up --build
    ```

3.  **Access the Dashboard**:
    Open [http://app.localtest.me:3000](http://app.localtest.me:3000).
    *   **Email**: `admin@vantus.systems`
    *   **Password**: `password123`

## Architecture

*   **Control Plane** (`apps/control-plane`): Next.js 16 application for management.
*   **Config Renderer** (`services/config-renderer`): Generates and deploys Nginx configurations safely.
*   **Edge Nginx**: The data plane proxying traffic to upstreams.
*   **Observability**: Vector -> Loki (Logs), OpenTelemetry -> VictoriaMetrics (Metrics).

## Services

| Service | URL (Host) | Description |
| :--- | :--- | :--- |
| **Control Plane** | `http://app.localtest.me:3000` | Management Dashboard |
| **Grafana** | `http://localhost:3002` | Metrics & Logs Dashboards (`admin`/`admin`) |
| **Tenant 1** | `http://tenant1.localtest.me` | Demo Tenant 1 (Proxied) |
| **Tenant 2** | `http://tenant2.localtest.me` | Demo Tenant 2 (Proxied) |
| **VictoriaMetrics** | `http://localhost:8428` | Prometheus-compatible metrics |
| **Loki** | `http://localhost:3100` | Log aggregation |

## Development

### Commands

*   `pnpm install`: Install dependencies.
*   `pnpm test`: Run unit tests.
*   `pnpm e2e`: Run Playwright E2E tests.
*   `pnpm --filter database generate`: Generate Prisma client.

### Directory Structure

```
/vantus-proxy
  /apps
    /control-plane       # Next.js App
  /services
    /config-renderer     # Config Generator Service
  /infra
    /docker              # Docker Compose
    /nginx               # Templates
  /observability         # OTel, Vector, Grafana configs
  /database              # Prisma Schema & Seeds
```

## Known Limitations

*   **Migrations**: In this demo environment, migrations are not committed as SQL files because a running DB was not available during generation. The system relies on `prisma db push` or manual migration generation on first run.
*   **Certificates**: Self-signed certificates or Let's Encrypt staging should be used for `*.localtest.me`.

## License

Private.
