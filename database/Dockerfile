FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run generate --workspace=database

CMD ["/bin/sh", "-c", "npx prisma db push --schema=database/prisma/schema.prisma && npm run seed --workspace=database"]
