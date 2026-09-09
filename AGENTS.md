# AGENTS.md — Operational Guidelines for AI Agents

Welcome to the **Veylix** project. This document defines the engineering standards, collaboration protocols, and architectural invariants for all AI agents (Antigravity, Jules, and future autonomous contributors) working on this codebase.

---

## 1. Mission and Core Philosophy

Veylix is an **Enterprise Asset Inventory Platform** built as a **modular monolith of near-production quality**.

Our engineering core values:

- **KISS (Keep It Simple, Stupid)**: Choose the simplest architecture that solves the problem correctly.
- **YAGNI (You Aren't Gonna Need It)**: Do not introduce speculative features, tables, microservices, or complex patterns without immediate necessity.
- **DRY (Don't Repeat Yourself)**: Eliminate business logic duplication, but do not force premature visual or structural abstractions.
- **SOLID**: Enforce single responsibility, explicit interfaces, dependency inversion, and clean domain boundaries.
- **Security & Observability by Design**: Every feature must include authorization, validation, audit trails, and structured logging.

---

## 2. Agent Roles and Collaboration Protocol

### 2.1 Agent Roles

- **Antigravity (Lead Orchestrator / Lead Engineer)**: Responsible for planning stages, scaffolding foundations, implementing domain architecture, maintaining documentation integrity, and ensuring compliance with the Definition of Done.
- **Jules (Autonomous Coding Peer / Reviewer)**: Authenticated in the CLI via `jules`. Collaborates on checkpoints, architectural reviews, independent security audits, frontend/design system reviews, refactoring, and test gap analysis.

### 2.2 Checkpoint & Handoff Workflow

The project evolves in strictly separated sequential stages (Etapas 0 through 9). Each stage must end in a clean, buildable, and tested state before pushing to Git and stopping at the designated checkpoint:

1. **Implement stage requirements** (strictly within the scope of the current stage).
2. **Run verification suite**:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
3. **Commit with Conventional Commits** (e.g. `feat: implement asset domain and persistence`).
4. **Push to remote repository**: `git push origin <branch>`.
5. **Stop at the designated Checkpoint** and issue a clear, structured prompt for Jules.
6. **Review Jules's findings** before proceeding to subsequent stages.

---

## 3. Tech Stack & Versioning Policy

Before installing any new dependency, verify that:

1. It is the **current stable release** (no deprecated packages, no unapproved alphas/betas/canaries).
2. It is strictly needed and cannot be cleanly solved by existing workspace packages.
3. It has a permissive license and active maintenance.

### Core Stack

- **Language**: TypeScript (in `strict: true` mode throughout all packages and apps).
- **Monorepo Orchestration**: `pnpm` (workspace) + `Turborepo`.
- **Backend**: NestJS (modular architecture, thin controllers, use-case application services, Prisma ORM).
- **Frontend**: Next.js (App Router, Server Components by default, Client Components only when interactive state is required).
- **Design System**: Tailwind CSS + shadcn/ui + Radix UI primitives (`packages/ui`).
- **Database**: PostgreSQL + Prisma ORM.
- **Testing**: Vitest (Unit & Integration), Playwright (E2E), fast-check (Property-based when applicable).
- **Logging & Observability**: Pino (structured JSON logging) + OpenTelemetry (traces and metrics).
- **Security**: Argon2id password hashing, database-backed secure sessions, Helmet headers, granular RBAC/policies.

---

## 4. Repository Structure & Boundary Rules

```text
veylix/
├── apps/
│   ├── web/                     # Next.js App Router Web Application
│   └── api/                     # NestJS Modular Monolith API
│
├── packages/
│   ├── ui/                      # Design System (primitives, components, tokens)
│   ├── types/                   # Shared TypeScript domain types and contracts
│   ├── validation/              # Shared Zod / class-validator schemas
│   ├── eslint-config/           # Monorepo ESLint configurations
│   └── typescript-config/       # Shared tsconfig bases
│
├── prisma/                      # Prisma schema, migrations, seed script
├── docs/                        # Complete technical & operational documentation
├── tooling/                     # Build, CI, and development tools
├── AGENTS.md                    # Agent collaboration guidelines (this file)
├── turbo.json                   # Turborepo task pipeline
├── pnpm-workspace.yaml          # pnpm workspace definition
├── package.json                 # Monorepo root manifest
└── README.md                    # Project landing documentation
```

### Strict Boundary Invariants:

1. **Domain Logic Isolation**: NestJS controllers must be thin. Business logic belongs in Application Services / Use Cases and Domain Policies.
2. **Persistence Boundary**: Application code must interact with persistence through Repositories / Services, not raw ad-hoc Prisma calls scattered across controllers.
3. **No Cross-Module Database Leaks**: Module A must not directly mutate Module B's database entities without going through Module B's public domain service.
4. **No Premature Packages**: Do not create a new `packages/*` directory unless there is genuine code reuse across apps or clear governance boundaries.
5. **Frontend State Discipline**: Distinguish between Server State (Server Components / React Query / SWR), URL State (`nuqs` / searchParams), Form State (`react-hook-form` + Zod), and Local UI State (`useState`). Do not add global store libraries without concrete need.

---

## 5. Domain Invariants (Must Be Upheld)

Every agent must respect and enforce these non-negotiable domain rules:

- **INV-001**: An Asset must have at most one current assigned custodian (Employee).
- **INV-002**: A `RETIRED` or `LOST` asset cannot be transferred or assigned.
- **INV-003**: An asset in `MAINTENANCE` status cannot be transferred to a new employee.
- **INV-004**: Transferring an asset generates exactly one immutable `AssetMovement` record in an atomic transaction.
- **INV-005**: All critical domain and security operations generate an immutable `AuditLog` entry.
- **INV-006**: Opening or closing a maintenance ticket must transition the asset state machine consistently.
- **INV-007**: Concurrent operations on the same asset (e.g. concurrent transfers) must be guarded via optimistic locking (`version` counter) and pessimistic row locks (`SELECT FOR UPDATE` in transactions) to prevent race conditions.

---

## 6. Definition of Done (DoD)

Before declaring any task or stage complete:

- [ ] All code compiles without errors (`pnpm build`).
- [ ] TypeScript strict checks pass with zero errors across all workspaces (`pnpm typecheck`).
- [ ] ESLint passes without unapproved warnings or disabled rules (`pnpm lint`).
- [ ] Prettier formatting is verified (`pnpm format:check`).
- [ ] All unit and integration tests pass (`pnpm test`).
- [ ] Positive and negative authorization tests are written for any new/modified endpoint.
- [ ] Documentation is updated in the same commit (no documentation drift).
- [ ] No secrets, credentials, or personal information exist in code or logs.
- [ ] Git commit follows Conventional Commits format.

---

## 7. Operational Commands

```bash
# Install dependencies
pnpm install

# Start local database via Docker
docker compose up -d postgres

# Run database migrations and seed
pnpm db:migrate
pnpm db:seed

# Start development servers (Turbo TUI)
pnpm dev

# Run quality checks
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

## 8. Continuous Documentation Requirement

If you change an API route, update `docs/api/conventions.md` or OpenAPI decorators.
If you alter the database schema, update `docs/database/design.md`.
If you alter security policies, update `docs/security/threat-model.md`.
Documentation drift is considered a critical defect.
