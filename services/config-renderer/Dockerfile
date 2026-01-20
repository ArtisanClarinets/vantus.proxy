FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run generate --workspace=database
RUN npm run build --workspace=config-renderer

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
