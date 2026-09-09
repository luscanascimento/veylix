# Backup & Disaster Recovery Runbook

## 1. Recovery Objectives

- **Recovery Point Objective (RPO)**: $< 15$ minutes (via continuous WAL archiving).
- **Recovery Time Objective (RTO)**: $< 1$ hour.

---

## 2. PostgreSQL Backup Procedures

### 2.1 Automated Daily Snapshot (pg_dump)

```bash
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -Fc -f /backups/veylix_$(date +%Y%m%d_%H%M%S).dump
```

### 2.2 Restoration Drill Procedure

1. Create a clean staging database: `createdb -h $DB_HOST -U $DB_USER veylix_restore_test`
2. Restore from dump file: `pg_restore -h $DB_HOST -U $DB_USER -d veylix_restore_test -v /backups/latest.dump`
3. Execute integrity verification queries.
