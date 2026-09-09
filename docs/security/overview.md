# Security Architecture & Principles

Security is a foundational quality requirement in Veylix. We implement **Defense in Depth**, least privilege, and strict boundary controls across all architectural layers.

---

## 1. Core Security Principles

- **Zero Trust Transport**: All communication between client and server occurs over TLS (HTTPS/WSS).
- **Server-Side Enforcement**: Client-side UI controls are for user experience only. All authentication, authorization, validation, and domain invariants are strictly verified on the backend.
- **Fail Closed**: In the event of an ambiguous authorization rule or unhandled error, the system must deny access and abort transactions.
- **Least Privilege**: Users and services operate with the minimum set of permissions necessary to execute their duties.
- **Non-Repudiation**: All critical mutating actions produce an immutable audit log recording the actor, client IP, user agent, timestamp, request ID, and trace ID.

---

## 2. HTTP Security Controls

1. **Helmet Middleware**: Configures essential security headers:
   - `Strict-Transport-Security` (HSTS): `max-age=31536000; includeSubDomains; preload`
   - `X-Content-Type-Options`: `nosniff`
   - `X-Frame-Options`: `DENY`
   - `Referrer-Policy`: `strict-origin-when-cross-origin`
   - `Content-Security-Policy` (CSP): Strict script, style, and object source restrictions.
2. **CORS Restrictions**:
   - Explicit allowlist of origin domains specified via `CORS_ORIGINS` environment variable.
   - Wildcards (`*`) are prohibited when credentials (cookies) are enabled.
3. **Rate Limiting**:
   - Global throttler: 100 requests per minute per IP.
   - Sensitive auth endpoints (`/login`, `/forgot-password`, `/reset-password`): 5 requests per minute per IP.
