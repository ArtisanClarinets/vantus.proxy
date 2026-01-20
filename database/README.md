# Database

This workspace contains the **Prisma** schema, migrations, and seed scripts for the Vantus Proxy Platform. It exports a generated Prisma Client used by the Control Plane and Config Renderer.

## Tech Stack

*   **Database:** MariaDB 10.6+
*   **ORM:** Prisma
*   **Seeding:** TypeScript (ts-node)

## Schema

The schema (`prisma/schema.prisma`) defines the core data models:
*   **User/Account:** Authentication and RBAC.
*   **Tenant:** The core isolation unit.
*   **Domain:** DNS names associated with tenants.
*   **UpstreamPool/Target:** Backend services to proxy to.
*   **DeploymentHistory:** Audit log of config changes.

## Workflow

### 1. Modifying the Schema

Edit `prisma/schema.prisma`.

### 2. Generating the Client

After any schema change, regenerate the client:

```bash
npm run generate-client
```

### 3. Migrations

To apply changes to the database and create a migration file:

```bash
# From root
npx prisma migrate dev --schema=database/prisma/schema.prisma
```

### 4. Seeding

To populate the database with initial data (default admin, demo tenants):

```bash
npm run seed --workspace=database
```

## Environment Variables

*   `DATABASE_URL`: Connection string for MariaDB.
*   `ADMIN_EMAIL`: Default admin email for seeding.
*   `ADMIN_PASSWORD`: Default admin password for seeding.
