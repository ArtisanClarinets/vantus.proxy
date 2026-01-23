# AGENTS.md

This file provides guidelines for AI agents working in the Vantus Proxy repository.

## Project Overview

Enterprise-grade Nginx Control Plane + Proxy with multi-tenancy, RBAC, and observability. Monorepo using pnpm workspace with:
- `apps/control-plane`: Next.js 16 application (React 19, App Router)
- `services/config-renderer`: Fastify service for generating Nginx configs
- `database`: Shared Prisma client and seed scripts

## Build Commands

### Install Dependencies
```bash
pnpm install
```

### Build All Packages
```bash
pnpm -r build
```

### Individual Package Builds
```bash
# Control Plane (Next.js standalone)
cd apps/control-plane && pnpm build

# Config Renderer (TypeScript compilation)
cd services/config-renderer && pnpm build
```

### Generate Prisma Client
```bash
pnpm --filter database generate
```

## Linting

### Lint All Packages
```bash
pnpm -r lint
```

### Control Plane
```bash
cd apps/control-plane && pnpm lint
```

## Testing

### Run All Tests
```bash
pnpm -r test
```

### Run E2E Tests (Playwright)
```bash
pnpm e2e
```

### Run Single E2E Test
```bash
cd tests && pnpm exec playwright test smoke.spec.ts --project=chromium
# Or with specific test:
pnpm exec playwright test smoke.spec.ts -t "homepage loads"
```

### Config Renderer Unit Tests (Vitest)
```bash
cd services/config-renderer && pnpm test
# Run single test file:
pnpm test src/renderer.test.ts
# Run single test:
pnpm test -- "should render tenant config"
```

### Control Plane Unit Tests (Vitest)
```bash
cd apps/control-plane && pnpm test
```

## Development

### Start Development Servers
```bash
# Control Plane (Next.js)
cd apps/control-plane && pnpm dev

# Config Renderer (tsx watch)
cd services/config-renderer && pnpm dev
```

### Seed Database
```bash
cd database && pnpm seed
```

## Code Style Guidelines

### TypeScript
- Strict mode enabled in all packages
- Use explicit types; avoid `any`
- Use `unknown` instead of `any` when type is uncertain
- Prefer interfaces over type aliases for object shapes
- Use `zod` for runtime validation (required on all route handlers)

### Naming Conventions
- **Files**: `kebab-case.tsx` for components, `kebab-case.ts` for utilities
- **Components**: `PascalCase.tsx`
- **Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE` or `camelCase` for local
- **Types/Interfaces**: `PascalCase`
- **Database Models**: `PascalCase` in Prisma schema
- **Database Tables**: `snake_case` via `@@map`

### Imports
- Use absolute imports with `@/` alias (e.g., `import { prisma } from '@/lib/db'`)
- Import React only when needed (`"use client"` components don't need `import React`)
- Group imports: external → internal → relative
- Use `import type` for type-only imports

### React Components
- Use `"use client"` directive for client components
- Prefer Server Components by default
- Use React 19 features (no `use client` for hooks unless needed)
- Use `next/navigation` router hooks
- Use Tailwind CSS with `clsx`/`tailwind-merge` for conditional classes

### Error Handling
- Use `try/catch` with proper error logging
- Throw `Error` objects with descriptive messages
- Handle Prisma errors with proper fallbacks
- Return consistent error responses: `{ status: 'error', message: string }`
- Never expose internal errors to clients

### Security
- Validate ALL user input with Zod schemas
- Never use `NEXT_PUBLIC_*` for secrets
- Authenticate all internal API calls with bearer tokens
- Use `CONFIG_RENDERER_SECRET` for service-to-service auth
- Implement least-privilege RBAC (OWNER, ADMIN, OPERATOR, VIEWER)
- Log audit events for all write operations

### Database (Prisma)
- Use Prisma Client singleton pattern with global fallback
- Export types from `@prisma/client` in database package
- Use `async/await` for all database operations
- Handle connection pooling properly

### Nginx Config Rendering
- Always validate tenant slugs and domains before rendering
- Use parameterized queries to prevent injection
- Test configs with `nginx -t` before deployment
- Use atomic writes (temp file → rename)

### Logging
- Use structured logging with appropriate levels (info, warn, error)
- Redact secrets from logs
- Include context (tenantId, userId, operation) in log entries

### Git Conventions
- Write clear, concise commit messages
- Keep changes focused and atomic
- Run lint/tests before committing

## Architecture Notes

- Config Renderer should NOT be exposed publicly; accessed via Control Plane BFF
- Control Plane uses Better Auth (not NextAuth)
- All route handlers must validate input with Zod
- Tenant isolation enforced via layout boundaries
- Audit logging required on all mutations
