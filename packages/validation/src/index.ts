import { z } from "zod";
import {
  AssetStatus,
  MovementType,
  MaintenanceStatus,
  MaintenancePriority,
  UserRole,
} from "@veylix/types";

// Standard Pagination Query Schema
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  sort: z.string().optional(),
  cursor: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// ID & Business Key Schemas
export const idSchema = z.string().min(1, "ID must not be empty");

export const patrimonyNumberSchema = z
  .string()
  .regex(
    /^AST-\d{4}-\d{4,}$/,
    "Patrimony number must match format AST-YYYY-NNNN",
  );

export const employeeNumberSchema = z
  .string()
  .regex(/^EMP-\d{4,}$/, "Employee number must match format EMP-NNNN");

export const emailSchema = z.string().email("Invalid email address").max(255);

// Domain Enum Schemas
export const assetStatusSchema = z.nativeEnum(AssetStatus);
export const movementTypeSchema = z.nativeEnum(MovementType);
export const maintenanceStatusSchema = z.nativeEnum(MaintenanceStatus);
export const maintenancePrioritySchema = z.nativeEnum(MaintenancePriority);
export const userRoleSchema = z.nativeEnum(UserRole);
