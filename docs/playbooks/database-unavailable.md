# Incident Playbook: Database Unavailable

## 1. Symptoms

- API returning `503 Service Unavailable` or `DATABASE_TIMEOUT`.
- Readiness check `/health/readiness` returning `DOWN` for database component.
- Pino logs flooding with `database.query.failed` or connection refused errors.

## 2. Initial Checks

1. Check PostgreSQL container/service status: `docker ps | grep postgres`
2. Check database log output: `docker logs --tail 100 veylix-postgres`
3. Test direct TCP connection: `nc -zv localhost 5432`

## 3. Diagnosis

- **Connection Pool Exhausted**: Check active connections:
  `SELECT count(*) FROM pg_stat_activity;`
- **Disk Space Full**: Run `df -h` on database volume mount.
- **Corrupted WAL / Crash**: Look for PostgreSQL recovery messages in container logs.

## 4. Mitigation & Recovery

1. If pool exhausted: Restart API instances or adjust `connection_limit` in `DATABASE_URL`.
2. If PostgreSQL crashed: Restart database container `docker restart veylix-postgres`.
3. If persistent corruption: Initiate recovery from latest verified snapshot (see `docs/playbooks/data-recovery.md`).
