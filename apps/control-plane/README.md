# Control Plane

The **Control Plane** is the administrative interface for the Vantus Proxy Platform. It is built with **Next.js 16 (App Router)** and **React 19**, providing a modern, responsive UI for managing tenants, domains, upstream pools, and edge policies.

## Tech Stack

*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS 4
*   **Auth:** Better Auth
*   **State Management:** React Server Components (Server Actions for mutations)
*   **Data Fetching:** Direct DB access (Prisma) in Server Components

## Key Features

*   **Dashboard:** Overview of system health and tenant metrics.
*   **Tenant Management:** Create, update, and manage tenant configurations.
*   **Domain Management:** Bind domains to tenants and configure TLS.
*   **Upstream Pools:** Manage backend servers and load balancing strategies.
*   **Deployment History:** View audit logs of configuration deployments.

## Development

### Running Locally

The control plane is typically run via the root `npm run dev` or as part of the Docker stack. To run it in isolation:

```bash
# From root
npm run dev --workspace=control-plane
```

### Directory Structure

*   `app/`: App Router pages and layouts.
    *   `(auth)/`: Authentication routes (login, register).
    *   `(dashboard)/`: Protected dashboard routes.
    *   `api/`: API routes (e.g., health checks).
*   `components/`: Reusable UI components (shadcn/ui based).
*   `lib/`: Utility functions and shared logic.

## Environment Variables

See `.env.example` or the root `.env` generation script (`scripts/setup-env.js`) for required variables:
*   `DATABASE_URL`
*   `BETTER_AUTH_SECRET`
*   `BETTER_AUTH_URL`
*   `REDIS_URL`
