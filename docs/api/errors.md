# API Error Handling & Taxonomy

Veylix enforces a strictly standardized error response format across all endpoints. Internal exceptions, database queries, and stack traces are never exposed to clients.

---

## 1. Canonical Error Response Schema

All error responses return a JSON object with the following schema:

```json
{
  "code": "ASSET_INVALID_STATE_TRANSITION",
  "message": "Cannot transfer asset in MAINTENANCE status to an employee.",
  "requestId": "req_01J8K3M90ABCDEF",
  "details": {
    "currentStatus": "MAINTENANCE",
    "attemptedTransition": "IN_USE",
    "assetId": "ast_9921034"
  }
}
```

### Schema Fields

- `code` (`string`): Machine-readable uppercase snake-case error identifier.
- `message` (`string`): Human-readable, actionable description suitable for display or logging.
- `requestId` (`string`): The correlation ID for tracing the failed request across logs and traces.
- `details` (`object`, optional): Structured contextual details (field errors, constraint names, invariant metadata).

---

## 2. Validation Error Format (HTTP 400)

When payload validation fails (via class-validator or Zod), `details` contains field-specific violations:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request payload validation failed",
  "requestId": "req_01J8K3M90ABCDEF",
  "details": {
    "fields": [
      {
        "field": "patrimonyNumber",
        "message": "Patrimony number must match pattern AST-YYYY-NNNN"
      },
      {
        "field": "purchaseValue",
        "message": "Purchase value must be a positive number"
      }
    ]
  }
}
```

---

## 3. Error Code Taxonomy

### 3.1 Authentication & Authorization Errors

| Error Code                 | HTTP Status | Description                                    |
| -------------------------- | ----------- | ---------------------------------------------- |
| `AUTH_UNAUTHENTICATED`     | 401         | Missing, expired, or invalid session           |
| `AUTH_INVALID_CREDENTIALS` | 401         | Incorrect email or password (anti-enumeration) |
| `AUTH_SESSION_EXPIRED`     | 401         | Active session has timed out                   |
| `AUTH_FORBIDDEN`           | 403         | User role lacks required permission            |
| `AUTH_RESOURCE_DENIED`     | 403         | Object-level authorization policy failed       |

### 3.2 Domain & Invariant Errors

| Error Code                       | HTTP Status | Description                                             |
| -------------------------------- | ----------- | ------------------------------------------------------- |
| `ASSET_NOT_FOUND`                | 404         | Specified asset does not exist                          |
| `ASSET_INVALID_STATE_TRANSITION` | 422         | Attempted transition forbidden by state machine         |
| `ASSET_ALREADY_ASSIGNED`         | 409         | Asset already assigned to another employee              |
| `ASSET_IN_MAINTENANCE`           | 409         | Asset is locked in maintenance                          |
| `ASSET_RETIRED`                  | 409         | Retired asset cannot be modified or moved               |
| `EMPLOYEE_INACTIVE`              | 422         | Target custodian is marked inactive                     |
| `LOCATION_INACTIVE`              | 422         | Target location is marked inactive                      |
| `CONCURRENCY_CONFLICT`           | 409         | Optimistic lock collision (asset modified concurrently) |

### 3.3 Infrastructure & Rate Limiting Errors

| Error Code              | HTTP Status | Description                            |
| ----------------------- | ----------- | -------------------------------------- |
| `RATE_LIMIT_EXCEEDED`   | 429         | Exceeded maximum requests per window   |
| `INTERNAL_SERVER_ERROR` | 500         | Unexpected technical error (sanitized) |
| `DATABASE_TIMEOUT`      | 503         | Database operation timed out           |

---

## 4. Global Exception Filter Implementation

NestJS `HttpExceptionFilter` intercepts all thrown errors:

1. Translates `DomainException` subclasses into corresponding HTTP status and error codes.
2. Extracts and propagates `requestId` from the HTTP context.
3. Redacts internal SQL queries, connection strings, and stack traces before serializing to client.
4. Logs full error details with stack trace to Pino structured logger at `error` level.
