# ADR-0001: Monorepo Structure and Tooling

## Status

Accepted

## Context

Veylix consists of a web frontend application (`apps/web`), a backend API (`apps/api`), and shared libraries for the Design System (`packages/ui`), domain types (`packages/types`), validation schemas (`packages/validation`), and tooling configurations. We need an efficient build system and package manager that supports strict dependency governance, fast local builds, smart caching, and seamless developer experience without excessive repository fragmentation.

## Decision

We adopt a monorepo managed with **pnpm** (workspaces) and **Turborepo**:

1. `pnpm` provides fast, deterministic, space-efficient dependency resolution with strict isolation (preventing phantom dependencies).
2. `Turborepo` orchestrates parallel task pipelines (`build`, `lint`, `typecheck`, `test`) with dependency graph awareness and computation caching.
3. Shared packages are created only when genuine cross-project reuse or governance isolation is justified (KISS & YAGNI principles).

## Alternatives Considered

- _npm/yarn workspaces_: Slower dependency resolution, lacks native hardlinked content-addressable storage.
- _Nx_: Feature-rich but introduces significant configuration weight and abstractions unnecessary for our modular monorepo size.
- _Multi-repo_: Introduces high overhead in coordinating breaking schema changes, type sharing, and atomic PR commits across repositories.

## Consequences

- **Positive**: Fast incremental builds, shared TypeScript types across frontend and backend, unified CI pipelines, simplified refactoring.
- **Negative**: Requires learning Turborepo pipeline configuration and maintaining strict workspace boundary disciplines.
