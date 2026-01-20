# Config Renderer Service

The **Config Renderer** is a high-performance backend service responsible for generating valid Nginx configurations from the database state and deploying them to the Edge Nginx instances.

## Tech Stack

*   **Runtime:** Node.js (Fastify)
*   **Language:** TypeScript
*   **Templating:** Nunjucks
*   **Process Management:** PM2 (in production)

## Core Responsibilities

1.  **Render Configs:** Fetches tenant data from the database and renders Nginx configuration files using Nunjucks templates.
2.  **Validate:** Runs `nginx -t` to ensure generated configurations are syntactically correct.
3.  **Deploy:** Writes configurations to `/etc/nginx/conf.d/` and reloads Nginx.
4.  **Rollback:** Automatically reverts to the previous working state if validation or reload fails.

## API Endpoints

*   `POST /render`: Preview generated configurations for a tenant.
*   `POST /deploy`: Deploy a set of configurations to the live Nginx instance.
*   `GET /health`: Service health check.

## Development

### Running Locally

```bash
# From root
npm run dev --workspace=config-renderer
```

### Templates

Templates are located in `infra/nginx/templates` and are mounted into the container at runtime.
*   `tenant.server.conf.njk`: The main server block template for tenants.
