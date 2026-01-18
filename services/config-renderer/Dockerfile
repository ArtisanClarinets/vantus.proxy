FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter database generate
RUN pnpm --filter config-renderer build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache nginx

COPY --from=builder /app/services/config-renderer/dist ./dist
COPY --from=builder /app/services/config-renderer/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/database ./database

EXPOSE 3001
CMD ["node", "dist/index.js"]
