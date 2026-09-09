# Incident Playbook: Application & Database Rollback

## 1. Rollback Strategy Overview

Rollbacks must be executed deliberately to prevent data inconsistency or schema corruption.

## 2. Application Code Rollback

1. Identify the last known stable Git commit SHA or container image tag.
2. Redeploy the previous stable image tag:
   ```bash
   docker compose pull veylix-api:stable_tag
   docker compose up -d veylix-api
   ```
3. Verify `/health/readiness` responds with `200 OK`.

## 3. Database Migration Rollback

- If the migration followed the **Expand-and-Contract** pattern (added columns/tables), the previous code version will run safely without rolling back the database schema.
- If a destructive migration was applied, restore database from pre-deployment snapshot.
