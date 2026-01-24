# Vantus Proxy Platform

**Enterprise-grade Nginx Control Plane & Proxy with multi-tenancy, RBAC, and observability.**

The Vantus Proxy Platform is a modern, unified solution for managing Nginx-based edge traffic. It combines a user-friendly Control Plane (Next.js) with a robust Config Renderer (Fastify) to automate the deployment of secure, high-performance Nginx configurations.

---

## 🚀 Key Features

*   **Unified Control Plane:** A modern dashboard to manage tenants, domains, and upstreams.
*   **Safe Config Deployment:** Validates Nginx configurations before deployment to prevent outages.
*   **Multi-Tenancy:** Strict isolation of tenant configurations and resources.
*   **Observability Stack:** Integrated Logs (Loki), Metrics (VictoriaMetrics), and Tracing (OpenTelemetry).
*   **Role-Based Access Control:** Granular permissions for Owners, Admins, Operators, and Viewers.
*   **Automated TLS:** Integration with Certbot for automatic SSL certificate management.

---

## 🏗️ Architecture

The platform consists of four main components orchestrated via Docker:

1.  **Control Plane (`apps/control-plane`):**
    *   Next.js 16 (App Router) & React 19 application.
    *   Manages state in MariaDB via Prisma.
    *   Handles authentication and user management.

2.  **Config Renderer (`services/config-renderer`):**
    *   Fastify-based service that watches for configuration changes.
    *   Generates Nginx config files from Nunjucks templates.
    *   Validates and reloads the Edge Nginx instance.

3.  **Edge Nginx:**
    *   The high-performance data plane proxying actual traffic.
    *   Runs standard Nginx with dynamically updated configurations.

4.  **Observability Layer:**
    *   **Vector:** Collects logs and metrics.
    *   **Loki & VictoriaMetrics:** Storage backends.
    *   **Grafana:** Visualization dashboards.

---

## 🛠️ Getting Started

### Prerequisites

*   **Node.js 20+**
*   **Docker & Docker Compose**

### 1. Installation (Local Development)

Clone the repository and install dependencies. This will prompt you to configure your environment variables (or use defaults).

```bash
npm install
```

To initialize the environment (start Docker, Database, and Seed Data) in one go:

```bash
npm run setup
```

To run the full stack (setup + start apps):

```bash
npm run dev:all
```

### 2. Accessing the Platform

Once the stack is running, access the following services:

| Service | URL | Default Credentials |
| :--- | :--- | :--- |
| **Control Plane** | `http://localhost:3000` | `admin@vantus.systems` / `password123` |
| **Grafana** | `http://localhost:3002` | `admin` / `admin` |
| **Edge Proxy** | `http://localhost` | N/A |

### 3. Production Installation (Baremetal)

For production deployments on a fresh Ubuntu 22.04 server, use the provided installer script. This handles all dependencies, including Node.js, Docker, and PM2.

```bash
chmod +x scripts/install-ubuntu.sh
./scripts/install-ubuntu.sh
```

---

## 💻 Development

### Project Structure

```
/vantus-proxy
├── apps/
│   └── control-plane       # Next.js Management UI
├── services/
│   └── config-renderer     # Nginx Config Generator
├── database/               # Prisma Schema & Seeds
├── infra/
│   ├── docker/             # Docker configurations
│   ├── nginx/              # Templates & Snippets
│   └── observability/      # Grafana, Loki, Vector configs
├── scripts/                # Setup & Install scripts
└── tests/                  # E2E Tests
```

### Common Commands

*   `npm install`: Install dependencies and setup environment.
*   `npm run build`: Build all workspaces.
*   `npm run test`: Run unit tests across all workspaces.
*   `npm run generate-client`: Regenerate Prisma Client (after schema changes).

---

## 🔒 Security

*   **Default User:** The installer creates a default admin user (`admin@vantus.systems`). **Change this password immediately** upon first login.
*   **Secrets:** All sensitive configuration is managed via `.env` files. Ensure these are not committed to version control.
*   **Isolation:** Tenants are strictly isolated at the configuration level to prevent cross-tenant interference.

---

## 📄 License

**Private & Confidential.**
Copyright © 2026 Vantus Systems. All Rights Reserved.
