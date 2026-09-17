import { describe, it, expect, beforeEach } from "vitest";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "../src/common/guards/roles.guard.js";
import { AssetController } from "../src/modules/asset/asset.controller.js";
import { MaintenanceController } from "../src/modules/maintenance/maintenance.controller.js";
import { AuditController } from "../src/modules/audit/audit.controller.js";
import { CategoryController } from "../src/modules/category/category.controller.js";
import { LocationController } from "../src/modules/location/location.controller.js";
import { EmployeeController } from "../src/modules/employee/employee.controller.js";
import { UserRole } from "@veylix/types";
import { ForbiddenException, ExecutionContext } from "@nestjs/common";

describe("Security & Negative RBAC Matrix (Definition of Done Compliance)", () => {
  let reflector: Reflector;
  let rolesGuard: RolesGuard;

  const adminUser = {
    id: "usr_admin",
    role: UserRole.ADMIN,
    email: "admin@veylix.io",
  };
  const operatorUser = {
    id: "usr_operator",
    role: UserRole.OPERATOR,
    email: "operator@veylix.io",
  };
  const viewerUser = {
    id: "usr_viewer",
    role: UserRole.VIEWER,
    email: "viewer@veylix.io",
  };

  beforeEach(() => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(
    handler: (...args: never[]) => unknown,
    controllerClass: unknown,
    user: unknown,
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

    it("PUT /assets/:id (updateAsset): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
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

    it("POST /assets/:id/transfer (transferAsset): ADMIN and OPERATOR allowed, VIEWER forbidden", () => {
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

    it("GET /maintenance (listMaintenance): All roles allowed to view", () => {
      const handler = MaintenanceController.prototype.listMaintenance;

      expect(
        rolesGuard.canActivate(
          createMockExecutionContext(handler, MaintenanceController, adminUser),
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
  });
});
