# Structured Log Events & Audit Events Taxonomy

This document catalogs the stable event identifiers for operational logs and audit trail entries.

---

## 1. Operational Log Events

### 1.1 Authentication & Security Events

- `auth.login.success`: User successfully authenticated.
- `auth.login.failed`: Authentication failure (invalid credentials or inactive account).
- `auth.logout`: User initiated session termination.
- `auth.password.changed`: User updated their password.
- `auth.session.revoked`: Session explicitly terminated.
- `auth.brute_force.locked`: Account temporarily locked due to repeated failed logins.
- `authorization.denied`: Access denied by RBAC or Policy check.

### 1.2 Asset & Inventory Events

- `asset.created`: New asset registered in inventory.
- `asset.updated`: Asset attributes modified.
- `asset.transferred`: Custody or location transferred.
- `asset.retired`: Asset marked retired.
- `asset.lost`: Asset marked lost.
- `asset.deleted`: Asset removed (only if zero historical movements).
- `asset.transfer.failed`: Transfer aborted due to invariant or concurrency conflict.

### 1.3 Maintenance Events

- `maintenance.created`: Work order ticket opened.
- `maintenance.started`: Repair status updated to in progress.
- `maintenance.completed`: Repair finished, asset restored to available.
- `maintenance.cancelled`: Work order cancelled.

### 1.4 Employee & Master Data Events

- `employee.created`: New employee added.
- `employee.updated`: Employee department/position modified.
- `employee.deactivated`: Employee marked inactive.
- `location.created`: Physical site/room registered.
- `category.created`: Asset category registered.

### 1.5 System & Lifecycle Events

- `app.startup`: API server initialized and listening.
- `app.shutdown`: Graceful shutdown initiated.
- `http.request.completed`: HTTP request completed successfully.
- `http.request.failed`: HTTP request resulted in 4xx/5xx status.
- `database.query.failed`: Database query error or connection timeout.

---

## 2. Audit Trail Events (`AuditLog`)

Audit events represent business and compliance facts:

- `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `PASSWORD_RESET`
- `ASSET_CREATED`, `ASSET_UPDATED`, `ASSET_TRANSFERRED`, `ASSET_RETIRED`, `ASSET_LOST`
- `MAINTENANCE_OPENED`, `MAINTENANCE_CLOSED`, `MAINTENANCE_CANCELLED`
- `USER_CREATED`, `USER_ROLE_CHANGED`, `USER_DEACTIVATED`
- `EMPLOYEE_CREATED`, `EMPLOYEE_UPDATED`, `EMPLOYEE_DEACTIVATED`
