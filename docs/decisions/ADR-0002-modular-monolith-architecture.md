# ADR-0002: Modular Monolith Architecture

## Status

Accepted

## Context

Enterprise asset inventory management requires high transactional integrity (e.g. transferring an asset requires updating custodian records, validating location constraints, creating movement history, and emitting audit logs in an atomic transaction). We need to determine the macro-architectural paradigm for Veylix.

## Decision

We architect Veylix as a **Modular Monolith**:

1. Single deployable unit for the backend (`apps/api`) built on NestJS.
2. Structured into 10 encapsulated domain modules (`auth`, `users`, `employees`, `categories`, `locations`, `assets`, `movements`, `maintenance`, `audit`, `health`).
3. Each module enforces strict layer boundaries:
   $$\text{Controller (HTTP/DTO)} \longrightarrow \text{Application Service / Use Case} \longrightarrow \text{Domain Rules / Policies} \longrightarrow \text{Repository} \longrightarrow \text{Prisma}$$
4. Inter-module communication is conducted exclusively through exported module services, prohibiting cross-module direct database table mutations.

## Alternatives Considered

- _Microservices_: Rejected. Introduces distributed transaction complexity (Sagas/2PC), network latency, operational overhead (service meshes, Kubernetes clusters), and deployment fragility without immediate organizational necessity.
- _Unstructured Monolith (Big Ball of Mud)_: Rejected. Lacks boundaries, leading to spaghetti dependencies and difficult refactoring.

## Consequences

- **Positive**: Full ACID transactional guarantees, zero distributed network overhead, simple local development and single-container deployment, clear boundaries for future extraction if scale warrants.
- **Negative**: Requires strict discipline to prevent cross-module boundary violations (enforced via lint rules and code reviews).
