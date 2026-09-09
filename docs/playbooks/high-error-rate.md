# Incident Playbook: High Error Rate (5xx Spikes)

## 1. Symptoms

- 5xx response rate exceeds $1\%$ threshold over a 5-minute sliding window.
- Alerts triggered: `High5xxErrorRate`.

## 2. Initial Checks

1. Query Pino structured logs filtered by `level: "error"`:
   `grep '"level":"error"' /var/log/veylix/api.log | tail -n 50`
2. Group errors by `event` and `code` to identify the failing endpoint or subsystem.
3. Check OpenTelemetry trace dashboard for failing spans and exception stack traces.

## 3. Diagnosis

- If errors isolated to a specific route (e.g. `/api/assets/:id/transfers`): Inspect for unhandled edge case or database deadlock.
- If errors distributed across all routes: Inspect database connection pool saturation or memory degradation.

## 4. Mitigation

1. If related to a recent code release: Trigger immediate rollback (see `docs/playbooks/rollback.md`).
2. If related to database lock contention: Kill long-running blocking transactions.
