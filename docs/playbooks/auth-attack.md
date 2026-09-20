# Incident Playbook: Authentication Attack (Credential Stuffing / Brute Force)

## Overview

This playbook outlines the steps to detect, mitigate, and recover from authentication-based attacks, including credential stuffing, brute-force login attempts, and session hijacking.

## 1. Detection

- **High Error Rate**: Spike in `401 Unauthorized` responses on `/api/auth/login`.
- **Throttler Alerts**: Multiple IP addresses hitting the `@Throttle` limits on the login endpoint.
- **Anomalous Logins**: Unusual login locations or rapid successive logins for administrative accounts.

## 2. Immediate Mitigation

1. **Identify Source**: Extract attacker IP addresses or ASNs from logs.
2. **Block IPs**: Temporarily ban abusive IP addresses at the WAF or reverse proxy level.
3. **Revoke Sessions**: Use the `POST /api/auth/revoke-all` endpoint (or database intervention) to invalidate all active sessions for targeted or compromised accounts.
4. **Force Password Resets**: For accounts that show successful logins from anomalous IPs, force a password reset and notify the user.

## 3. Escalation

- Engage the Security Response Team (SRT) if administrative accounts are compromised.
- If data exfiltration is suspected, escalate to the Data Privacy Officer (DPO) and trigger the data breach response protocol.

## 4. Rollback & Recovery

- Monitor `/api/auth/login` logs for 24 hours to ensure the attack has subsided.
- Remove IP bans from the WAF after the attack signature is no longer present.
- Document the incident in a post-mortem, detailing the attack vector, mitigation time, and any data accessed.
