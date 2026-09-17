# Deployment & Production Guidelines

## 1. Containerization Principles

- **Multi-stage builds**: Minimal runtime images (`node:22-alpine` with Turborepo pruning).
- **Non-root execution**: Containers run under dedicated unprivileged system users (`nestjs:nodejs` and `nextjs:nodejs`, UID/GID 1001).
- **Secrets Management**: No secrets, certificates, or `.env` files baked into Docker images (`.dockerignore` enforced).
- **Health Probes**: Container orchestrators probe `/health/liveness` and `/health/readiness` (API), and `/api/health` (Web).
- **Rate Limiting & DoS Protection**: `@nestjs/throttler` global IP rate limiting (100 req/min), sensitive route throttling (`/api/auth/login` capped at 10 req/min), and 1MB request body payload cap.

---

## 2. Docker Compose Orchestration

The platform can be built and deployed via `docker-compose.yml`:

```bash
# Build and launch all services in detached mode
docker compose up -d --build

# Inspect container status and health
docker compose ps

# View unified structured logs
docker compose logs -f
```

### Service Architecture:

- `postgres` (port `5433:5432`): PostgreSQL 16 Alpine database with healthcheck (`pg_isready`).
- `api` (port `4000:4000`): NestJS Modular Monolith API with healthcheck (`/health/liveness`).
- `web` (port `3000:3000`): Next.js App Router standalone web frontend with healthcheck (`/api/health`).

---

## 3. Graceful Shutdown Protocol

Upon receiving `SIGTERM` or `SIGINT`:

1. Stop accepting new HTTP connections.
2. Allow in-flight requests up to 15 seconds to complete.
3. Terminate active database connection pools gracefully via Prisma `$disconnect()`.
4. Flush pending OpenTelemetry spans and Pino log buffers.
5. Exit process with code 0.
