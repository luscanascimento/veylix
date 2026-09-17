import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  paginationQuerySchema,
  patrimonyNumberSchema,
  employeeNumberSchema,
  emailSchema,
  assetStatusSchema,
} from "../src/index.js";
import { AssetStatus } from "@veylix/types";

describe("Validation Schemas Property-Based Testing (fast-check)", () => {
  describe("patrimonyNumberSchema", () => {
    it("property: strictly accepts valid formatted AST-YYYY-NNNN strings", () => {
      const validPatrimonyArb = fc
        .tuple(
          fc.integer({ min: 1000, max: 9999 }),
          fc.integer({ min: 1000, max: 99999 }),
        )
        .map(([year, num]) => `AST-${year}-${num}`);

      fc.assert(
        fc.property(validPatrimonyArb, (patrimony) => {
          const result = patrimonyNumberSchema.safeParse(patrimony);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("property: gracefully rejects arbitrary malformed strings without throwing uncaught errors", () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !/^AST-\d{4}-\d{4,}$/.test(s)),
          (invalidString) => {
            const result = patrimonyNumberSchema.safeParse(invalidString);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 150 },
      );
    });
  });

  describe("employeeNumberSchema", () => {
    it("property: strictly accepts valid EMP-NNNN strings", () => {
      const validEmpArb = fc
        .integer({ min: 1000, max: 99999 })
        .map((num) => `EMP-${num}`);

      fc.assert(
        fc.property(validEmpArb, (empNum) => {
          const result = employeeNumberSchema.safeParse(empNum);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("property: rejects invalid employee format without throwing", () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !/^EMP-\d{4,}$/.test(s)),
          (invalidString) => {
            const result = employeeNumberSchema.safeParse(invalidString);
            expect(result.success).toBe(false);
          },
        ),
        { numRuns: 150 },
      );
    });
  });

  describe("paginationQuerySchema", () => {
    it("property: handles any valid integer inputs and clamps appropriately", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10000 }),
          fc.integer({ min: 1, max: 100 }),
          (page, limit) => {
            const result = paginationQuerySchema.safeParse({ page, limit });
            expect(result.success).toBe(true);
            if (result.success) {
              expect(result.data.page).toBe(page);
              expect(result.data.limit).toBe(limit);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("property: rejects negative or zero numbers gracefully", () => {
      fc.assert(
        fc.property(fc.integer({ min: -1000, max: 0 }), (invalidNum) => {
          const result = paginationQuerySchema.safeParse({ page: invalidNum });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("property: limits exceeding 100 are rejected", () => {
      fc.assert(
        fc.property(fc.integer({ min: 101, max: 100000 }), (exceedingLimit) => {
          const result = paginationQuerySchema.safeParse({
            limit: exceedingLimit,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("assetStatusSchema", () => {
    it("property: parses all domain AssetStatus enum values", () => {
      const allStatuses = Object.values(AssetStatus);
      for (const status of allStatuses) {
        expect(assetStatusSchema.safeParse(status).success).toBe(true);
      }
    });

    it("property: rejects non-enum strings", () => {
      const allStatuses = Object.values(AssetStatus) as string[];
      fc.assert(
        fc.property(
          fc.string().filter((s) => !allStatuses.includes(s)),
          (unknownStatus) => {
            expect(assetStatusSchema.safeParse(unknownStatus).success).toBe(
              false,
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
