# Database Naming Conventions & Standards

To ensure consistency between PostgreSQL and TypeScript/Prisma, all schema elements must follow these standard conventions.

---

## 1. Naming Standards

| Element                | Database (PostgreSQL)       | Prisma Schema         | TypeScript / Domain     | Example                                                                      |
| ---------------------- | --------------------------- | --------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| **Tables / Models**    | Lowercase snake_case plural | PascalCase singular   | PascalCase class/type   | DB: `asset_movements`<br>Prisma: `AssetMovement`<br>TS: `AssetMovement`      |
| **Columns / Fields**   | Lowercase snake_case        | camelCase             | camelCase               | DB: `patrimony_number`<br>Prisma: `patrimonyNumber`<br>TS: `patrimonyNumber` |
| **Primary Keys**       | `id`                        | `id`                  | `id`                    | `id`                                                                         |
| **Foreign Keys**       | `<target_singular>_id`      | `<target_singular>Id` | `<target_singular>Id`   | DB: `assigned_employee_id`<br>Prisma: `assignedEmployeeId`                   |
| **Enums**              | Lowercase snake_case        | PascalCase            | UPPER_CASE enum members | DB: `asset_status`<br>Prisma: `AssetStatus`<br>TS: `AVAILABLE`               |
| **Indexes**            | `idx_<table>_<columns>`     | Standard Prisma index | N/A                     | `idx_assets_status_category_location`                                        |
| **Unique Constraints** | `uniq_<table>_<columns>`    | Standard `@unique`    | N/A                     | `uniq_assets_patrimony_number`                                               |

---

## 2. Standard Columns

Every business table must include:

- `id` (`VARCHAR(32)` CUID2): Primary key.
- `created_at` (`TIMESTAMPTZ`): Automatic creation timestamp (`@default(now())`).
- `updated_at` (`TIMESTAMPTZ`): Automatic update timestamp (`@updatedAt`).

---

## 3. Explicit Column Mapping in Prisma

All Prisma models must use `@@map("table_name")` and `@map("column_name")` to ensure clean separation between idiomatic PostgreSQL snake_case and idiomatic TypeScript camelCase.
