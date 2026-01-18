FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter database generate
RUN pnpm --filter control-plane build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/control-plane/next.config.ts ./
COPY --from=builder /app/apps/control-plane/public ./apps/control-plane/public
COPY --from=builder /app/apps/control-plane/.next/standalone ./
COPY --from=builder /app/apps/control-plane/.next/static ./apps/control-plane/.next/static

EXPOSE 3000
CMD ["node", "apps/control-plane/server.js"]
