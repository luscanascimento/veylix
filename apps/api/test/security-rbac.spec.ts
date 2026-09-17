import { describe, it, expect, beforeEach } from "vitest";
import { RolesGuard } from "../src/common/guards/roles.guard.js";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { UserRole } from "@veylix/types";
import { AssetController } from "../src/modules/asset/asset.controller.js";
import { MaintenanceController } from "../src/modules/maintenance/maintenance.controller.js";
import { AuditController } from "../src/modules/audit/audit.controller.js";
import { CategoryController } from "../src/modules/category/category.controller.js";
import { LocationController } from "../src/modules/location/location.controller.js";
import { EmployeeController } from "../src/modules/employee/employee.controller.js";

describe("Security RBAC Matrix (Positive and Negative Auth Tests)", () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  const adminUser = { id: "admin", role: UserRole.ADMIN };
  const operatorUser = { id: "op", role: UserRole.OPERATOR };
  const viewerUser = { id: "viewer", role: UserRole.VIEWER };

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(
    handler: (...args: never[]) => unknown,
    controllerClass: abstract new (...args: never) => unknown,
    user?: unknown,
  ): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => controllerClass,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  describe("AssetController RBAC Matrix", () => {
    it("POST /assets (createAsset): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = AssetController.prototype.createAsset;

      const adminCtx = createMockExecutionContext(
        handler,
        AssetController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        AssetController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        AssetController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("PATCH /assets/:id (updateAsset): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = AssetController.prototype.updateAsset;

      const adminCtx = createMockExecutionContext(
        handler,
        AssetController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        AssetController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        AssetController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("POST /assets/:id/assign (assignAsset): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = AssetController.prototype.assignAsset;

      const adminCtx = createMockExecutionContext(
        handler,
        AssetController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        AssetController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        AssetController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("POST /assets/:id/transfers (transferAsset): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = AssetController.prototype.transferAsset;

      const adminCtx = createMockExecutionContext(
        handler,
        AssetController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        AssetController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        AssetController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("POST /assets/:id/return (returnAsset): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = AssetController.prototype.returnAsset;

      const adminCtx = createMockExecutionContext(
        handler,
        AssetController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        AssetController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        AssetController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("POST /assets/:id/retire (retireAsset): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = AssetController.prototype.retireAsset;

      const adminCtx = createMockExecutionContext(
        handler,
        AssetController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        AssetController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        AssetController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("GET /assets & GET /assets/:id: ADMIN, OPERATOR, VIEWER all allowed", () => {
      const listHandler = AssetController.prototype.listAssets;
      const getHandler = AssetController.prototype.getAssetById;

      for (const handler of [listHandler, getHandler]) {
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(handler, AssetController, adminUser),
          ),
        ).toBe(true);
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(handler, AssetController, operatorUser),
          ),
        ).toBe(true);
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(handler, AssetController, viewerUser),
          ),
        ).toBe(true);
      }
    });

    it("GET /assets/:id/movements: ADMIN, OPERATOR, VIEWER all allowed", () => {
      const handler = AssetController.prototype.getAssetMovements;
      expect(
        rolesGuard.canActivate(
          createMockExecutionContext(handler, AssetController, adminUser),
        ),
      ).toBe(true);
      expect(
        rolesGuard.canActivate(
          createMockExecutionContext(handler, AssetController, operatorUser),
        ),
      ).toBe(true);
      expect(
        rolesGuard.canActivate(
          createMockExecutionContext(handler, AssetController, viewerUser),
        ),
      ).toBe(true);
    });
  });

  describe("MaintenanceController RBAC Matrix", () => {
    it("POST /maintenance (openMaintenance): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = MaintenanceController.prototype.openMaintenance;

      const adminCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("PATCH /maintenance/:id (updateMaintenance): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = MaintenanceController.prototype.updateMaintenance;

      const adminCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("POST /maintenance/:id/close: ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = MaintenanceController.prototype.closeMaintenance;

      const adminCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("POST /maintenance/:id/cancel: ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = MaintenanceController.prototype.cancelMaintenance;

      const adminCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        MaintenanceController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });

    it("GET /maintenance & GET /maintenance/:id (listMaintenance, getMaintenanceById): All roles allowed to view", () => {
      const listHandler = MaintenanceController.prototype.listMaintenance;
      const getHandler = MaintenanceController.prototype.getMaintenanceById;

      for (const handler of [listHandler, getHandler]) {
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(
              handler,
              MaintenanceController,
              adminUser,
            ),
          ),
        ).toBe(true);
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(
              handler,
              MaintenanceController,
              operatorUser,
            ),
          ),
        ).toBe(true);
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(
              handler,
              MaintenanceController,
              viewerUser,
            ),
          ),
        ).toBe(true);
      }
    });
  });

  describe("AuditController RBAC Matrix (Zero-Trust Privacy)", () => {
    it("GET /audit-logs: ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
      const handler = AuditController.prototype.listAuditLogs;

      const adminCtx = createMockExecutionContext(
        handler,
        AuditController,
        adminUser,
      );
      expect(rolesGuard.canActivate(adminCtx)).toBe(true);

      const opCtx = createMockExecutionContext(
        handler,
        AuditController,
        operatorUser,
      );
      expect(rolesGuard.canActivate(opCtx)).toBe(true);

      const viewerCtx = createMockExecutionContext(
        handler,
        AuditController,
        viewerUser,
      );
      expect(() => rolesGuard.canActivate(viewerCtx)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe("Category, Location, Employee Controllers RBAC", () => {
    it("all support lookups allow authenticated roles (ADMIN, OPERATOR, VIEWER)", () => {
      const catList = CategoryController.prototype.listCategories;
      const locList = LocationController.prototype.listLocations;
      const empList = EmployeeController.prototype.listEmployees;

      for (const handler of [catList, locList, empList]) {
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(handler, CategoryController, adminUser),
          ),
        ).toBe(true);
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(
              handler,
              LocationController,
              operatorUser,
            ),
          ),
        ).toBe(true);
        expect(
          rolesGuard.canActivate(
            createMockExecutionContext(handler, EmployeeController, viewerUser),
          ),
        ).toBe(true);
      }
    });
  });

  describe("Defensive Guard Rejections", () => {
    it("should throw ForbiddenException if user object is missing in request", () => {
      const handler = AssetController.prototype.createAsset;
      const ctx = createMockExecutionContext(
        handler,
        AssetController,
        undefined,
      );

      expect(() => rolesGuard.canActivate(ctx)).toThrow(
        new ForbiddenException("User role not found"),
      );
    });

    it("should throw ForbiddenException if user has no role property", () => {
      const handler = AssetController.prototype.createAsset;
      const ctx = createMockExecutionContext(handler, AssetController, {
        id: "u_no_role",
      });

      expect(() => rolesGuard.canActivate(ctx)).toThrow(
        new ForbiddenException("User role not found"),
      );
    });

    it("should throw ForbiddenException for unknown or spoofed role string", () => {
      const handler = AssetController.prototype.createAsset;
      const ctx = createMockExecutionContext(handler, AssetController, {
        id: "u_attacker",
        role: "SUPER_ROOT_HACKER",
      });

      expect(() => rolesGuard.canActivate(ctx)).toThrow(
        new ForbiddenException("Insufficient permissions"),
      );
    });

    it("should throw ForbiddenException for null role", () => {
      const handler = AssetController.prototype.createAsset;
      const ctx = createMockExecutionContext(handler, AssetController, {
        id: "u_attacker",
        role: null,
      });

      expect(() => rolesGuard.canActivate(ctx)).toThrow(
        new ForbiddenException("User role not found"),
      );
    });
  });
});
