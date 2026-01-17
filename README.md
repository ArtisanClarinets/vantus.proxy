# Vantus Proxy Control Plane

The **Vantus Proxy Control Plane** is an enterprise-grade solution designed to centralize the management of Nginx reverse proxies. It enables multi-tenant architecture, automated configuration generation, and granular edge policy enforcement through a modern, secure web interface.

## Key Features

- **Multi-Tenancy Management**: Create and manage isolated tenants with unique slugs and domains.
- **Automated Nginx Configuration**: Dynamically generate production-ready Nginx configurations with best-practice security headers and optimizations.
- **Edge Policy Control**: Configure rate limiting, CORS, CSP, and IP access lists per tenant without touching Nginx files directly.
- **Security First**: Built-in input validation, secure authentication, and role-based access control placeholders.
- **Deployment Simulation**: Preview generated configurations and simulate deployment workflows.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: SQLite (Dev) / PostgreSQL (Prod) via [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (Credentials Provider with bcrypt)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: TypeScript

## Directory Structure

```
├── app/                  # Next.js App Router (Pages & API)
│   ├── app/              # Protected Application Routes (Dashboard, Tenants)
│   ├── auth/             # Authentication Routes (Login)
│   └── api/              # API Endpoints
├── components/           # Reusable React Components
├── lib/                  # Core Business Logic
│   ├── auth.ts           # Authentication Configuration
│   ├── db.ts             # Database Client
│   ├── nginx-generator.ts# Nginx Config Generation Engine
│   └── proxy-control.ts  # Mock Deployment Logic
├── prisma/               # Database Schema & Migrations
├── public/               # Static Assets
└── scripts/              # Utility Scripts (Admin Creation, Seeding)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/vantus/proxy-control-plane.git
    cd proxy-control-plane
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Setup the database:**
    ```bash
    # Ensure DATABASE_URL is set in .env (defaults to file:./dev.db for dev)
    npx prisma db push
    ```

4.  **Create an Admin User:**
    Since registration is restricted, use the provided script to create your first admin user.
    ```bash
    npx tsx scripts/create-admin.ts admin@vantus.systems mysecurepassword
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

6.  **Access the application:**
    Open [http://localhost:3000](http://localhost:3000) and log in with the credentials you created.

## Security & Production Readiness

This application has been reviewed for production readiness:
- **Secure Authentication**: Passwords are hashed using `bcryptjs`.
- **Input Validation**: Strict validation on domain names and slugs prevents Nginx configuration injection attacks.
- **Optimized Builds**: unused dependencies removed, build scripts verified.

## Future Expansion

See [TODO.md](./TODO.md) for the roadmap, including real-time metrics integration, audit logging implementation, and external Nginx agent development.
