import { describe, it, expect } from "vitest";
import {
  patrimonyNumberSchema,
  employeeNumberSchema,
  paginationQuerySchema,
  emailSchema,
} from "../src/index.js";

describe("Validation Schemas", () => {
  it("should validate valid patrimony numbers", () => {
    expect(patrimonyNumberSchema.safeParse("AST-2026-0001").success).toBe(true);
    expect(patrimonyNumberSchema.safeParse("INVALID").success).toBe(false);
  });

  it("should validate valid employee numbers", () => {
    expect(employeeNumberSchema.safeParse("EMP-10042").success).toBe(true);
    expect(employeeNumberSchema.safeParse("10042").success).toBe(false);
  });

  it("should validate email format", () => {
    expect(emailSchema.safeParse("admin@veylix.corp").success).toBe(true);
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });

  it("should apply defaults for pagination query", () => {
    const parsed = paginationQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(25);
  });
});
