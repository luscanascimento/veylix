# Incident Playbook: Data Corruption & Recovery

## 1. Symptoms

- Accidental data deletion, corrupted rows, or unauthorized mass modification reported.

## 2. Initial Containment

1. Temporarily place application into Maintenance Mode (disable mutating HTTP methods via reverse proxy).
2. Take an immediate point-in-time snapshot of the current database state before altering anything.

## 3. Recovery Procedures

1. Restore the most recent valid backup dump to a secondary staging database (`veylix_recovery`).
2. Use the `audit_logs` table on the production database to identify all mutations that occurred between the backup timestamp and the corruption event.
3. Extract and cherry-pick valid historical records or reconstruct lost data using `AssetMovement` and `AuditLog` deltas.
4. Verify referential integrity with constraints enabled.
5. Re-enable production traffic.
