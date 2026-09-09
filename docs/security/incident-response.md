# Security Incident Response Protocol

This document defines the emergency protocol for security incident classification, containment, and recovery.

---

## 1. Incident Severity Classification

| Level                | Definition                                                                   | Response Time          | Escalation                           |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------- | ------------------------------------ |
| **SEV-1 (Critical)** | Active database compromise, authentication bypass, data exfiltration         | Immediate ($< 15$ min) | Engineering Lead, CTO, Security Team |
| **SEV-2 (High)**     | Flaw allowing unauthorized data modification or partial privilege escalation | $< 1$ hour             | Lead Engineer, Security Team         |
| **SEV-3 (Medium)**   | Rate-limit failure, minor IDOR with non-sensitive data                       | $< 4$ hours            | On-call Engineer                     |
| **SEV-4 (Low)**      | Informational disclosure (e.g. non-sensitive banner or header)               | $< 24$ hours           | Development Team                     |

---

## 2. Containment Protocols

### 2.1 Compromised User Account

1. Revoke all active sessions: `DELETE FROM sessions WHERE user_id = $userId;`
2. Deactivate user account: `UPDATE users SET is_active = false WHERE id = $userId;`
3. Force password reset.

### 2.2 Suspected Mass Session Hijacking

1. Rotate `SESSION_SECRET` environment variable.
2. Flush all active sessions: `TRUNCATE TABLE sessions;`
3. All users will be forced to re-authenticate.

### 2.3 Secret Leakage (e.g. Database credentials exposed)

1. Rotate database password on PostgreSQL server.
2. Update application environment configuration (`DATABASE_URL`).
3. Trigger rolling restart of application instances.
