import { describe, it, expect, vi } from "vitest";
import { CategoryService } from "../src/modules/category/category.service.js";
import { CategoryController } from "../src/modules/category/category.controller.js";
import { LocationService } from "../src/modules/location/location.service.js";
import { LocationController } from "../src/modules/location/location.controller.js";
import { EmployeeService } from "../src/modules/employee/employee.service.js";
import { EmployeeController } from "../src/modules/employee/employee.controller.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { NotFoundException } from "@nestjs/common";

describe("Support Modules (Category, Location, Employee)", () => {
  describe("Category", () => {
    it("should list active categories and find by id", async () => {
      const mockPrisma = {
        category: {
          findMany: vi.fn().mockResolvedValue([{ id: "cat_1", name: "IT" }]),
          findUnique: vi.fn().mockResolvedValue({ id: "cat_1", name: "IT" }),
        },
      } as unknown as PrismaService;

      const service = new CategoryService(mockPrisma);
      const controller = new CategoryController(service);

      const list = await controller.listCategories();
      expect(list).toHaveLength(1);

      const one = await controller.getCategoryById("cat_1");
      expect(one.name).toBe("IT");
    });

    it("should throw NotFoundException when category does not exist", async () => {
      const mockPrisma = {
        category: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      } as unknown as PrismaService;

      const service = new CategoryService(mockPrisma);
      await expect(service.getCategoryById("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("Location", () => {
    it("should list active locations and find by id", async () => {
      const mockPrisma = {
        location: {
          findMany: vi
            .fn()
            .mockResolvedValue([{ id: "loc_1", name: "HQ Floor 1" }]),
          findUnique: vi
            .fn()
            .mockResolvedValue({ id: "loc_1", name: "HQ Floor 1" }),
        },
      } as unknown as PrismaService;

      const service = new LocationService(mockPrisma);
      const controller = new LocationController(service);

      const list = await controller.listLocations();
      expect(list).toHaveLength(1);

      const one = await controller.getLocationById("loc_1");
      expect(one.name).toBe("HQ Floor 1");
    });

    it("should throw NotFoundException when location does not exist", async () => {
      const mockPrisma = {
        location: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      } as unknown as PrismaService;

      const service = new LocationService(mockPrisma);
      await expect(service.getLocationById("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("Employee", () => {
    it("should list active employees and find by id", async () => {
      const mockPrisma = {
        employee: {
          findMany: vi
            .fn()
            .mockResolvedValue([{ id: "emp_1", name: "Jane Doe" }]),
          findUnique: vi
            .fn()
            .mockResolvedValue({ id: "emp_1", name: "Jane Doe" }),
        },
      } as unknown as PrismaService;

      const service = new EmployeeService(mockPrisma);
      const controller = new EmployeeController(service);

      const list = await controller.listEmployees();
      expect(list).toHaveLength(1);

      const one = await controller.getEmployeeById("emp_1");
      expect(one.name).toBe("Jane Doe");
    });

    it("should throw NotFoundException when employee does not exist", async () => {
      const mockPrisma = {
        employee: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      } as unknown as PrismaService;

      const service = new EmployeeService(mockPrisma);
      await expect(service.getEmployeeById("unknown")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
