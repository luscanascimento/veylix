# ADR-0006: Database Persistence, Integrity, and Audit Strategy

## Status

Accepted

## Context

Corporate asset compliance requires an immutable audit trail and historical chain-of-custody tracking. We need a persistence and schema design that enforces relational integrity and prevents data tampering.

## Decision

1. Use **PostgreSQL 16+** with **Prisma ORM**.
2. Entities use **CUID2** primary keys to prevent ID enumeration attacks and support distributed creation.
3. Enforce referential integrity with `ON DELETE RESTRICT` on master business records to prevent accidental cascading deletions.
4. Maintain an immutable, append-only **`AuditLog`** table recording all mutating operations with before/after JSONB deltas.
5. Maintain an immutable, append-only **`AssetMovement`** table recording every custodial transfer, reassignment, and physical relocation.

## Alternatives Considered

- _Event Sourcing for Entire Database_: Rejected. Excessive architectural complexity, steep learning curve, and complicates relational querying and pagination for standard CRUD views.
- _Database Triggers for Auditing_: Rejected in favor of application-level audit logging to capture authenticated user context, client IP, request ID, and trace ID without database-level coupling.

## Consequences

- **Positive**: Full audit compliance, complete traceability of physical equipment, robust referential integrity, straightforward relational query patterns.
- **Negative**: Audit tables grow continuously and will require time-based partition archival at large enterprise scale.
