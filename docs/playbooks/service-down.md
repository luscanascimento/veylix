# Incident Playbook: Service Down

## 1. Symptoms

- HTTP 502 / 503 / 504 gateway errors returned to users.
- Synthetic liveness probes failing on `/health/liveness`.
- Alerts triggered: `ServiceUnreachable` or `ZeroTrafficAnomaly`.

## 2. Initial Checks

1. Check process status on container host: `docker ps | grep veylix-api`
2. Check recent application logs for fatal panic or OOM killer:
   `docker logs --tail 100 veylix-api`
3. Check host memory and CPU utilization: `top -b -n 1`

## 3. Diagnosis

- If container crashed with exit code 137: Out of Memory (OOM). Check memory limits.
- If container failed on startup: Check `.env` database connection string or missing required environment variables.

## 4. Mitigation & Recovery

1. Restart container: `docker restart veylix-api`
2. Verify liveness endpoint: `curl -I http://localhost:4000/health/liveness`
3. Verify readiness endpoint: `curl -I http://localhost:4000/health/readiness`

## 5. Post-Incident Actions

- File post-mortem, review container memory reservations, and add automated restart policies.
