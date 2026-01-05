# BASE
FROM node:20-alpine AS base

WORKDIR /app

# BUILDER
FROM base AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci && \
    npm cache clean --force

COPY . .

RUN npx nx build api-gateway --prod

# RUNNER
FROM base AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --omit-dev

EXPOSE 80

CMD ["node", "dist/apps/api-gateway/main"]
