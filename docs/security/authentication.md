# Authentication & Session Architecture

Veylix implements a stateful, database-backed session architecture providing robust security, instant revocation, and protection against token theft.

---

## 1. Password Hashing (Argon2id)

- **Algorithm**: `Argon2id` (the winner of the Password Hashing Competition and OWASP recommendation).
- **Parameters**:
  - Memory cost: `65536` KiB (64 MiB)
  - Time cost / Iterations: `3`
  - Parallelism: `4` threads
  - Hash length: `32` bytes

---

## 2. Session Management & Cookie Strategy

- **Token Generation**: Cryptographically secure 32-byte pseudo-random string (using `crypto.randomBytes(32)`).
- **Database Storage**: The raw token is NEVER stored in the database. Instead, the server computes and stores `SHA-256(raw_token)` in the `sessions` table.
- **Cookie Configuration**:
  ```typescript
  res.cookie("veylix_session", rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  ```

---

## 3. Session Lifecycle & Invalidation

- **Session Rotation**: When a user logs in or changes their password, a new session token is issued.
- **Single Logout**: Deletes the current session row from the database and clears the cookie.
- **Global Logout (Revoke All Sessions)**: Deletes all session records matching `user_id`, immediately revoking access across all active devices.
- **Absolute & Inactivity Expiry**:
  - Absolute lifetime: 7 days.
  - Sliding inactivity window: Session updated on activity if $> 1$ hour elapsed since last touch.

---

## 4. Password Reset Workflow

1. User requests password reset via `POST /api/auth/forgot-password`.
2. Server generates a high-entropy 32-byte token and stores `SHA-256(token)` in `password_reset_tokens` with a 15-minute expiration.
3. Server returns a constant generic response (`"If an account exists with this email, instructions have been sent."`) to prevent user enumeration.
4. User submits new password with the token via `POST /api/auth/reset-password`.
5. Server validates token, updates password hash, revokes all existing sessions, marks reset token as `used_at = NOW()`, and logs an audit event.
