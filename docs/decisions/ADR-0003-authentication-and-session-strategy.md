# ADR-0003: Authentication and Session Strategy

## Status

Accepted

## Context

We need a secure, robust authentication mechanism for enterprise operators and administrators that resists credential stuffing, brute force attacks, session hijacking, cross-site scripting (XSS) token theft, and cross-site request forgery (CSRF), while supporting instantaneous server-side session revocation.

## Decision

We adopt **Argon2id password hashing** paired with **Database-backed Session Management**:

1. User passwords are encrypted with `Argon2id` (OWASP recommended parameters: 64MB memory, 3 iterations, 4 parallelism).
2. Sessions generate cryptographically secure 256-bit random tokens, stored exclusively as SHA-256 hashes in the `sessions` table.
3. Tokens are transmitted to the browser in `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
4. Server can revoke any individual session or all active user sessions instantly by deleting database records.
5. Sensitive auth routes are protected with strict rate limiting and progressive delays.

## Alternatives Considered

- _Stateless JWT in LocalStorage_: Rejected. Highly vulnerable to XSS token exfiltration and cannot be revoked server-side prior to token expiration without maintaining a blacklist (which negates the stateless benefit).
- _Bcrypt_: Good, but Argon2id provides superior resistance to GPU/ASIC-based offline cracking.

## Consequences

- **Positive**: Instant revocation, immunity to JavaScript XSS token theft (`HttpOnly`), full visibility into active user devices, state-of-the-art password protection.
- **Negative**: Database lookup on authenticated requests (mitigated via indexed `session_token_hash` and future in-memory caching if needed).
