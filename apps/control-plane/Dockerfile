FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run generate --workspace=database
RUN npm run build --workspace=control-plane

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/control-plane/next.config.ts ./
COPY --from=builder /app/apps/control-plane/public ./apps/control-plane/public
COPY --from=builder /app/apps/control-plane/.next/standalone ./
COPY --from=builder /app/apps/control-plane/.next/static ./apps/control-plane/.next/static

EXPOSE 3000
CMD ["node", "apps/control-plane/server.js"]
