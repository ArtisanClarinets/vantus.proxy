# Agent Guidelines for Vantus Proxy

This document provides essential information for agentic coding tools operating in the `vantus-proxy-monorepo`.

## 1. Project Architecture & Directory Structure

The repository is structured as a monorepo using NPM Workspaces:

- **`apps/control-plane`**: A Next.js 16 (React 19) application serving as the administrative UI. Uses Tailwind CSS 4 and Better Auth.
- **`services/config-renderer`**: A Fastify-based backend service responsible for generating and deploying Nginx configurations.
- **`database/`**: Contains the Prisma schema (`prisma/schema.prisma`), shared Prisma client, and seed scripts.
- **`infra/`**: Infrastructure-as-code or deployment configurations (e.g., Dockerfiles).
- **`observability/`**: OpenTelemetry and logging configurations.
- **`tests/e2e`**: Playwright end-to-end tests covering the entire system.
- **`scripts/`**: Utility scripts for environment setup and CI/CD.

## 2. Build, Lint, and Test Commands

### Root Commands
- **Install dependencies:** `npm install`
- **Build all workspaces:** `npm run build`
- **Lint all workspaces:** `npm run lint`
- **Run all tests:** `npm run test`
- **Generate Database Client:** `npm run generate-client` (Run this after any Prisma schema change)

### Workspace-Specific Commands
Execute commands within a specific workspace using the `--workspace` flag:
- `npm run build --workspace=control-plane`
- `npm run dev --workspace=config-renderer`
- `npm run test --workspace=control-plane`

### Running Single Tests
- **Vitest (Unit/Integration):** 
  - Run all tests in a file: `npx vitest run path/to/file.test.ts`
  - Run a specific test by pattern: `npx vitest run -t "should render config"`
  - Run in watch mode: `npx vitest path/to/file.test.ts`
- **Playwright (E2E):**
  - Run a single spec: `npx playwright test tests/e2e/login.spec.ts`
  - Run with UI: `npx playwright test --ui`

---

## 3. Code Style Guidelines

### Language & Modernity
- **TypeScript:** Strict mode is mandatory. Use interfaces for public APIs and types for internal data structures.
- **Node.js:** Targets version 18 or higher. Use modern ESM syntax.
- **React:** Uses React 19 features (e.g., `use` hook, Server Components by default in Next.js).

### Formatting
- **Indentation:** 4 spaces (Standard for this project).
- **Semicolons:** Required at the end of statements.
- **Quotes:** 
  - Use **single quotes** (`'`) for strings in backend services (`services/`) and shared packages.
  - Use **double quotes** (`"`) for strings in Next.js components and TSX files.
- **Trailing Commas:** Use trailing commas in multi-line objects and arrays.

### Naming Conventions
- **Folders/Files:** Use `kebab-case.ts`. React components use `PascalCase.tsx`.
- **Variables & Functions:** `camelCase`.
- **Classes, Interfaces, & Types:** `PascalCase`.
- **Enums:** `PascalCase` for the enum name, `UPPER_CASE` for its members.
- **Database:** Prisma models are `PascalCase`. Use `@@map("snake_case")` to map to database tables.

### Imports & Exports
- **Order of Imports:**
  1. Node.js built-ins (`fs`, `path`).
  2. External npm packages (`fastify`, `react`).
  3. Internal monorepo packages (`database`, `observability`).
  4. Local relative imports (`../components/Button`).
- **Naming:** Prefer named exports over default exports, except for Next.js pages/layouts.

### Error Handling
- **Async Operations:** Always wrap with `try/catch`.
- **Logging:** Use the service-specific logger (e.g., `fastify.log` in services or a shared logger in apps).
- **Validation:** Use `Zod` to validate all external input (API bodies, environment variables).

---

## 4. Database Patterns
- **Prisma Client:** Always import the client from the `database` package: `import { prisma } from 'database'`.
- **Migrations:** Modifying the schema requires a migration. Run `npx prisma migrate dev` in the `database` directory.
- **Seeding:** Use `npm run seed --workspace=database` to populate the DB for development.

---

## 5. Frontend Guidelines (Next.js & Tailwind)
- **Components:** Favor Server Components. Use `'use client'` only when state, effects, or browser APIs are needed.
- **Styling:** Use Tailwind CSS 4. Prefer utility classes over custom CSS. Use `clsx` and `tailwind-merge` for dynamic classes.
- **Icons:** Use `lucide-react`.

---

## 6. Development Workflow for Agents
1. **Analyze:** Check `package.json` in the relevant workspace for specific dependencies.
2. **Schema:** If the task involves new data, update `database/prisma/schema.prisma` and run `npm run generate-client`.
3. **Logic:** Implement changes following the established style (check neighboring files).
4. **Test:** Add a unit test in a `.test.ts` file co-located with the source code.
5. **Verify:** Run `npm run lint` and the specific test file before submitting.

---

## 7. Tech Stack Reference
- **Frontend:** Next.js 16, React 19, TanStack Query v5, TanStack Table v8.
- **Backend:** Fastify v4, Prisma v5.
- **Authentication:** Better Auth.
- **Testing:** Vitest, Playwright.
- **Infrastructure:** Docker, Nginx (rendered via templates).
