# Database Migration Workflow & Guidelines

Veylix utilizes **Prisma Migrate** for deterministic schema evolution and version-controlled database migrations.

---

## 1. Migration Commands

### Development (Creating Migrations)

```bash
# Apply schema changes and generate a new migration file
pnpm db:migrate:dev --name add_asset_movement_table
```

### Production / CI (Deploying Migrations)

```bash
# Apply all pending migrations without prompting
pnpm db:migrate:deploy
```

### Resetting Local Development Database

```bash
# WARNING: Wipes database and runs all migrations + seed
pnpm db:migrate:reset
```

---

## 2. Zero-Downtime Migration Principles (Expand-and-Contract)

When modifying existing columns or constraints on production databases:

1. **Phase 1 (Expand)**: Add the new column/table as nullable or with a safe default. Deploy backend code that writes to both old and new columns.
2. **Phase 2 (Backfill)**: Run an asynchronous data migration script to populate data in the new column for historical rows.
3. **Phase 3 (Contract)**: Deploy backend code that reads and writes exclusively to the new column. Remove old column in a final migration.

---

## 3. Seed Strategy

Deterministic development seed data is managed via `prisma/seed.ts`.
It must populate:

- Admin, Operator, and Viewer test users.
- Standard Categories (IT, Facilities, Vehicles, Machinery).
- Standard Locations (Headquarters, Floors, Warehouse).
- Test Employees across departments.
- Sample Assets spanning all 5 status states.
- Sample AssetMovements, Maintenance work orders, and Audit logs.

Execute seed:

```bash
pnpm db:seed
```
