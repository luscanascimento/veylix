# STRIDE Threat Model & Security Controls

This document details the STRIDE threat analysis for the Veylix enterprise asset platform, mapping potential attack vectors, mitigations, and verification tests.

---

## 1. Threat Analysis & Mitigations

### 1.1 Spoofing (Identity Deception)

- **Threat**: Attacker steals or brute-forces user credentials or hijacks session cookies.
- **Mitigation**:
  - Passwords hashed with Argon2id (memory cost 64MB, 3 iterations, 4 parallelism).
  - Session IDs generated as cryptographically secure random 256-bit tokens, stored as SHA-256 hashes in database.
  - Cookies marked `HttpOnly`, `Secure`, `SameSite=Lax` or `SameSite=Strict`.
  - Rate-limiting on login endpoints and progressive account lockout after failed attempts.
- **Verification Test**: `tests/security/authentication/brute-force.spec.ts`.

### 1.2 Tampering (Data Modification)

- **Threat**: Attacker tampers with request payload (e.g. modifying `patrimonyNumber`, injecting malicious SQL, or mass-assigning `role: ADMIN`).
- **Mitigation**:
  - NestJS `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` strictly blocks mass assignment.
  - All database operations use Prisma parameterized queries; raw concatenated SQL is forbidden.
  - State transitions validated against explicit `AssetStateMachine`.
- **Verification Test**: `tests/security/validation/mass-assignment.spec.ts`.

### 1.3 Repudiation (Denial of Action)

- **Threat**: Malicious actor transfers or retires an asset and claims another user did it.
- **Mitigation**:
  - Every mutation writes an immutable `AuditLog` entry in the same transaction.
  - `AssetMovement` records capture `performedByUserId`, `ipAddress`, and `timestamp`.
- **Verification Test**: `tests/security/audit/audit-generation.spec.ts`.

### 1.4 Information Disclosure (Data Leakage)

- **Threat**: Attacker discovers asset data or employee PII via IDOR (Insecure Direct Object Reference) or verbose error messages.
- **Mitigation**:
  - Object-level authorization policies (`AssetPolicy`, `EmployeePolicy`) verify read permissions.
  - Global exception filter sanitizes all responses, stripping internal DB errors and stack traces.
  - Pino log redactor scrubs passwords, tokens, and authorization headers from logs.
- **Verification Test**: `tests/security/authorization/idor.spec.ts`, `tests/security/information-disclosure/secret-leakage.spec.ts`.

### 1.5 Denial of Service (DoS)

- **Threat**: Attacker floods API with massive JSON payloads or deep pagination queries (`limit=999999999`).
- **Mitigation**:
  - NestJS body parser size capped at 1MB.
  - Pagination query DTOs enforce strict maximum limit (`limit <= 100`).
  - Rate limiting per IP and per authenticated user.
- **Verification Test**: `tests/security/rate-limit/rate-limiting.spec.ts`.

### 1.6 Elevation of Privilege

- **Threat**: `VIEWER` user invokes an administrative endpoint (e.g., `DELETE /api/assets/:id`).
- **Mitigation**:
  - Route handlers protected by `RolesGuard` and `PermissionGuard`.
  - Roles strictly enforced: `ADMIN > OPERATOR > VIEWER`.
- **Verification Test**: `tests/security/authorization/rbac.spec.ts`.
