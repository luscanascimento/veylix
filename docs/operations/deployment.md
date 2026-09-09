# Deployment & Production Guidelines

## 1. Containerization Principles

- **Multi-stage builds**: Minimal runtime images (Node Alpine or Distroless).
- **Non-root execution**: Containers must run under a dedicated unprivileged user (`node:node`, UID 1000).
- **Secrets Management**: No secrets, certificates, or `.env` files baked into Docker images.
- **Health Probes**: Container orchestrators must probe `/health/liveness` and `/health/readiness`.

---

## 2. Graceful Shutdown Protocol

Upon receiving `SIGTERM` or `SIGINT`:

1. Stop accepting new HTTP connections.
2. Allow in-flight requests up to 15 seconds to complete.
3. Terminate active database connection pools gracefully via Prisma `$disconnect()`.
4. Flush pending OpenTelemetry spans and Pino log buffers.
5. Exit process with code 0.
