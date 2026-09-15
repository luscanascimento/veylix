# Veylix — Enterprise Asset Inventory Platform

Veylix is a modern, enterprise-grade physical asset inventory and lifecycle management platform designed as a **modular monolith of near-production quality**.

Built with a focus on robust software engineering, security by design, high observability, and clean domain boundaries, Veylix ensures strict accountability, auditability, and operational efficiency for corporate equipment, IT assets, and facilities.

**Motivation Note**: Beyond solving real enterprise asset management needs, one of the core motivations of this project is to serve as a rigorous testbed to evaluate **Jules** (and the AI orchestrator agent, Antigravity) in action. It provides a highly structured, invariant-heavy environment to test autonomous code generation, peer reviews, architectural compliance, and offensive security analysis.

---

## Key Capabilities

- **Asset Lifecycle Management**: Full asset tracking from procurement, assignment, transfer, and maintenance to retirement or loss.
- **Explicit State Machine**: Guarded status transitions (`AVAILABLE`, `IN_USE`, `MAINTENANCE`, `RETIRED`, `LOST`) enforcing business invariants.
- **Chain of Custody & Auditability**: Tamper-evident, immutable movement logs and security audit trails.
- **Concurrency & Integrity Protection**: Optimistic locking and pessimistic row locks to prevent race conditions during concurrent reassignments.
- **Granular RBAC & Security**: Role-based and object-level authorization (`ADMIN`, `OPERATOR`, `VIEWER`), Argon2id password hashing, and secure cookie sessions.
- **Modern Developer Experience**: Next.js App Router, NestJS modular backend, PostgreSQL with Prisma ORM, and Turborepo orchestration.

---

## Architectural Summary

Veylix follows a **Modular Monolith** architecture:

- **Frontend (`apps/web`)**: Next.js 16 (App Router), React 19, TypeScript strict, Server Components by default, Tailwind CSS, shadcn/ui.
- **Backend (`apps/api`)**: NestJS 12, TypeScript strict, Clean Layered Architecture (Transport $\to$ Application $\to$ Domain $\to$ Infrastructure), Prisma ORM.
- **Database (`prisma/`)**: PostgreSQL 16+ with strict foreign keys, check constraints, composite indexes, and optimistic locking version counters.
- **Shared Packages (`packages/`)**:
  - `packages/ui`: Accessible Design System (Tailwind, Radix UI, Storybook).
  - `packages/types`: Shared domain interfaces and DTO contracts.
  - `packages/validation`: Shared runtime schemas (Zod / class-validator).
  - `packages/eslint-config` & `packages/typescript-config`: Centralized tooling configs.

---

## Repository Structure

```text
veylix/
├── apps/
│   ├── web/                     # Next.js App Router Web Application
│   └── api/                     # NestJS Modular Monolith API
│
├── packages/
│   ├── ui/                      # Design System (primitives, components, tokens)
│   ├── types/                   # Shared TypeScript domain contracts
│   ├── validation/              # Shared validation schemas
│   ├── eslint-config/           # Centralized ESLint configurations
│   └── typescript-config/       # Centralized TypeScript configurations
│
├── prisma/                      # Prisma schema, migrations, seed script
├── docs/                        # Comprehensive architectural & operational docs
├── tooling/                     # Build, CI, and tooling scripts
├── AGENTS.md                    # Guidelines for autonomous AI agents
├── turbo.json                   # Turborepo task pipeline
├── pnpm-workspace.yaml          # Monorepo workspace configuration
├── package.json                 # Monorepo root manifest
└── README.md                    # Project landing documentation
```

---

## Quick Start

### Prerequisites

- Node.js $\ge 22.0.0$
- pnpm $\ge 10.0.0$
- Docker & Docker Compose

### 1. Clone and Install Dependencies

```bash
git clone git@github.com:luscanascimento/veylix.git
cd veylix
pnpm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

### 3. Start Infrastructure (PostgreSQL)

```bash
docker compose up -d postgres
```

### 4. Apply Database Migrations and Seed

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Launch Development Servers

```bash
pnpm dev
```

- Web App: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:4000/api](http://localhost:4000/api)
- Swagger UI: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## Engineering Standards & Quality Gates

Every change must pass our strict Definition of Done before commit:

```bash
pnpm lint        # Zero lint warnings/errors
pnpm typecheck   # Zero TypeScript errors (strict: true)
pnpm test        # Unit & Integration test suite
pnpm build       # Monorepo build pipeline
```

---

## Documentation Index

Explore the complete project documentation in [`docs/`](./docs/):

- [Architecture Overview](./docs/architecture/overview.md) | [Module Catalog](./docs/architecture/modules.md) | [Layer Boundaries](./docs/architecture/boundaries.md)
- [Database Design & ER Model](./docs/database/design.md) | [Conventions](./docs/database/conventions.md) | [Migrations](./docs/database/migrations.md)
- [API Conventions](./docs/api/conventions.md) | [Error Handling](./docs/api/errors.md)
- [Security Overview](./docs/security/overview.md) | [Threat Model](./docs/security/threat-model.md) | [Authentication](./docs/security/authentication.md)
- [Observability & OpenTelemetry](./docs/observability/overview.md) | [Log Events Catalog](./docs/observability/log-events.md)
- [Testing Strategy](./docs/testing/test-strategy.md)
- [Operational Playbooks](./docs/playbooks/service-down.md)
- [Architecture Decision Records (ADRs)](./docs/decisions/ADR-0001-monorepo-structure-and-tooling.md)
