# ADR-0004: Asset State Machine and Concurrency Control

## Status

Accepted

## Context

Assets undergo critical lifecycle transitions (`AVAILABLE`, `IN_USE`, `MAINTENANCE`, `RETIRED`, `LOST`). In an enterprise environment, concurrent operations (e.g. two operators simultaneously attempting to reassign or open maintenance on the same laptop) must never produce inconsistent states or orphan assignments.

## Decision

1. Implement an **Explicit State Machine** (`AssetStateMachine`) that validates all status changes and prevents invalid transitions (e.g., `MAINTENANCE` $\to$ `IN_USE` directly or transferring a `RETIRED` asset).
2. Enforce **Optimistic Concurrency Control** via an integer `version` column on the `Asset` table.
3. Enforce **Pessimistic Row Locking** (`SELECT FOR UPDATE`) within interactive Prisma transactions during critical domain operations (transfers, maintenance status changes).

## Alternatives Considered

- _Implicit status booleans (`isAvailable`, `isInMaintenance`)_: Rejected due to combinatorial complexity and high risk of invalid contradictory states.
- _Last-Write-Wins (Uncontrolled updates)_: Rejected because concurrent requests would silently overwrite assignments without generating proper movement history.

## Consequences

- **Positive**: Absolute data integrity, zero lost updates, strict business invariant enforcement (`INV-001` to `INV-007`).
- **Negative**: Concurrent colliding requests will receive an explicit `409 Conflict` and must be retried by the client.
