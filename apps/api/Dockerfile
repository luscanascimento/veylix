# syntax=docker/dockerfile:1

# 1. Base stage with Node 22, PNPM, and Alpine dependencies
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.2.0 --activate

# 2. Pruner stage - isolates monorepo dependencies for api
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@^2.10.12
COPY . .
RUN turbo prune api --docker

# 3. Installer & Builder stage
FROM base AS installer
WORKDIR /app

# Copy dependency specifications from pruner and prisma schema
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY prisma ./prisma

# Install dependencies using frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy pruned source files
COPY --from=pruner /app/out/full/ .

# Generate Prisma Client & build workspace dependencies and API
RUN pnpm db:generate
RUN pnpm turbo run build --filter=api...

# 4. Production Runner stage
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Run as non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built application and required workspace files
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=nestjs:nodejs /app/packages ./packages
COPY --from=installer --chown=nestjs:nodejs /app/apps/api ./apps/api
COPY --from=installer --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health/liveness || exit 1

CMD ["sh", "-c", "if [ -f apps/api/dist/src/main.js ]; then node apps/api/dist/src/main.js; else node apps/api/dist/main.js; fi"]
