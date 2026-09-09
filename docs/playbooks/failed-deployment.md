# Incident Playbook: Failed Deployment

## 1. Symptoms

- CI/CD deployment pipeline fails health check verification step.
- New container fails to transition to `healthy` state within timeout window.

## 2. Initial Checks

1. Inspect deployment logs from container orchestrator / CI runner.
2. Check container startup logs for validation errors (e.g. missing environment variables).
3. Check if database migrations failed during pre-deploy phase.

## 3. Mitigation & Rollback

1. Abort deployment immediately.
2. Direct traffic back to previous stable container version.
3. If migration was applied and incompatible with old version, apply down-migration or hotfix.
