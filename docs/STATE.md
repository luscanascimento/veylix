# Veylix — Current State & Checkpoint Tracker

This file tracks the active progress of the Veylix platform development across all sessions.

---

## Current Status

- **Completed Stage**: ETAPA 8 — Production Hardening
- **Current Checkpoint**: CHECKPOINT G — Jules Production Readiness Review (PENDING)
  - Scope:
    1. DoS / Rate Limiting protection (`@nestjs/throttler`) with IP-based limits globally (100 req/min) and strict limits on `/api/auth/login` (10 req/min).
    2. Health probes protection (`@SkipThrottle` on `HealthController`).
    3. Security Headers & Payload Size Limits (Helmet CSP, HSTS, Express `json({ limit: "1mb" })`).
    4. Production Multi-Stage Dockerfiles (`apps/api/Dockerfile`, `apps/web/Dockerfile`, `.dockerignore`, `docker-compose.yml` with healthchecks).
    5. Database connection resilience & graceful shutdown hooks.
    6. Full DoD verification across all workspaces (184 tests passing).
- **Next Stage**: ETAPA 9 — Final Review (`docs/final-review.md`)

---

## Roadmap & Checkpoints Progress

- [x] **ETAPA 0: Discovery + Architecture** (Commit `15032bf`)
- [x] **CHECKPOINT A: Jules Architecture Review** (Merged in `f804d7c`)
- [x] **ETAPA 1: Foundation** (Commit `8344fb2`)
- [x] **ETAPA 2: Design System + Application Shell** (Commit `7a7e4a7`)
- [x] **CHECKPOINT B: Jules Frontend Review** (Merged in `11a01ea`)
- [x] **ETAPA 3: Domain + Database** (Commit `682f625`)
- [x] **CHECKPOINT C: Jules Domain & Database Review** (Merged in `cba0908`)
- [x] **ETAPA 4: Authentication + Authorization** (Commit `fcb6108`)
- [x] **CHECKPOINT D: Jules Security Review (Offensive)** (Merged in `fcb6108`)
- [x] **ETAPA 5: Core Asset Management** (Merged in `1f9283f`)
- [x] **ETAPA 6: Maintenance + Audit + Observability** (Commit `70a43b5`)
- [x] **CHECKPOINT E: Jules Production Readiness & Observability Audit** (Commit `b04f581`)
- [x] **ETAPA 7: Testing Hardening** (Commit `33ee9f2`)
- [x] **CHECKPOINT F: Jules Test Suite Review** (Merged in `1e19864`)
- [x] **ETAPA 8: Production Hardening** (Commit pending)
- [ ] **CHECKPOINT G: Jules Production Readiness Review**
- [ ] **ETAPA 9: Final Review (`docs/final-review.md`)**
