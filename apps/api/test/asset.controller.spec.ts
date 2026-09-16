import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssetController } from "../src/modules/asset/asset.controller.js";
import { AssetService } from "../src/modules/asset/services/AssetService.js";
import { RolesGuard } from "../src/common/guards/roles.guard.js";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@veylix/types";
import { ForbiddenException, ExecutionContext } from "@nestjs/common";
import { VeylixRequest } from "../src/common/middleware/request-id.middleware.js";

describe("AssetController (and RBAC Authorization Guard)", () => {
  let controller: AssetController;
  let service: AssetService;
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  const mockUserAdmin = {
    id: "user_admin",
    email: "admin@veylix.corp",
    name: "Admin User",
    role: UserRole.ADMIN,
  };

  const mockUserOperator = {
    id: "user_operator",
    email: "op@veylix.corp",
    name: "Operator User",
    role: UserRole.OPERATOR,
  };

  const mockUserViewer = {
    id: "user_viewer",
    email: "viewer@veylix.corp",
    name: "Viewer User",
    role: UserRole.VIEWER,
  };

  const mockReq = {
    ip: "127.0.0.1",
    headers: { "user-agent": "Vitest/1.0" },
    requestId: "req_test",
    traceId: "trace_test",
    socket: { remoteAddress: "127.0.0.1" },
  } as unknown as VeylixRequest;

  beforeEach(() => {
    service = {
      listAssets: vi.fn(),
      getAssetById: vi.fn(),
      createAsset: vi.fn(),
      updateAsset: vi.fn(),
      assignAsset: vi.fn(),
      transferAsset: vi.fn(),
      returnAsset: vi.fn(),
      retireAsset: vi.fn(),
      getAssetMovements: vi.fn(),
    } as unknown as AssetService;

    controller = new AssetController(service);
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(
    handler: (...args: never[]) => unknown,
    user: unknown,
  ): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => AssetController,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  describe("Authorization Policies (DOD Compliance)", () => {
    describe("POST /api/assets (createAsset)", () => {
      it("should allow ADMIN to create asset (Positive Auth)", () => {
        const ctx = createMockExecutionContext(
          controller.createAsset,
          mockUserAdmin,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should allow OPERATOR to create asset (Positive Auth)", () => {
        const ctx = createMockExecutionContext(
          controller.createAsset,
          mockUserOperator,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should forbid VIEWER from creating asset (Negative Auth)", () => {
        const ctx = createMockExecutionContext(
          controller.createAsset,
          mockUserViewer,
        );
        expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });

      it("should forbid unauthenticated user from creating asset (Negative Auth)", () => {
        const ctx = createMockExecutionContext(controller.createAsset, null);
        expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe("POST /api/assets/:id/transfers (transferAsset)", () => {
      it("should allow ADMIN to transfer asset", () => {
        const ctx = createMockExecutionContext(
          controller.transferAsset,
          mockUserAdmin,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should allow OPERATOR to transfer asset", () => {
        const ctx = createMockExecutionContext(
          controller.transferAsset,
          mockUserOperator,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should forbid VIEWER from transferring asset", () => {
        const ctx = createMockExecutionContext(
          controller.transferAsset,
          mockUserViewer,
        );
        expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe("POST /api/assets/:id/retire (retireAsset)", () => {
      it("should allow ADMIN to retire asset", () => {
        const ctx = createMockExecutionContext(
          controller.retireAsset,
          mockUserAdmin,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should allow OPERATOR to retire asset", () => {
        const ctx = createMockExecutionContext(
          controller.retireAsset,
          mockUserOperator,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should forbid VIEWER from retiring asset", () => {
        const ctx = createMockExecutionContext(
          controller.retireAsset,
          mockUserViewer,
        );
        expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe("GET /api/assets (listAssets)", () => {
      it("should allow VIEWER to list assets (Positive Auth)", () => {
        const ctx = createMockExecutionContext(
          controller.listAssets,
          mockUserViewer,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });
    });

    describe("GET /api/assets/:id/movements (getAssetMovements)", () => {
      it("should allow VIEWER to inspect movement audit trail", () => {
        const ctx = createMockExecutionContext(
          controller.getAssetMovements,
          mockUserViewer,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });
    });
  });

  describe("Controller Delegations", () => {
    it("should delegate listAssets to service", async () => {
      const query = { page: 1, limit: 10 };
      await controller.listAssets(query);
      expect(service.listAssets).toHaveBeenCalledWith(query);
    });

    it("should delegate getAssetById to service", async () => {
      await controller.getAssetById("asset_1");
      expect(service.getAssetById).toHaveBeenCalledWith("asset_1");
    });

    it("should delegate createAsset to service with current user id", async () => {
      const dto = {
        patrimonyNumber: "AST-2024-0001",
        name: "Laptop",
        categoryId: "cat_1",
        locationId: "loc_1",
        brand: "Dell",
        model: "XPS",
        purchaseDate: "2024-01-01",
        purchaseValue: 2000,
      };
      await controller.createAsset(dto, mockUserAdmin, mockReq);
      expect(service.createAsset).toHaveBeenCalledWith(dto, "user_admin", {
        ipAddress: "127.0.0.1",
        requestId: "req_test",
        traceId: "trace_test",
        userAgent: "Vitest/1.0",
      });
    });

    it("should delegate updateAsset to service", async () => {
      const dto = { name: "New Name", version: 1 };
      await controller.updateAsset("asset_1", dto, mockUserAdmin, mockReq);
      expect(service.updateAsset).toHaveBeenCalledWith(
        "asset_1",
        dto,
        "user_admin",
        {
          ipAddress: "127.0.0.1",
          requestId: "req_test",
          traceId: "trace_test",
          userAgent: "Vitest/1.0",
        },
      );
    });

    it("should delegate assignAsset to service", async () => {
      const dto = {
        toEmployeeId: "emp_1",
        toLocationId: "loc_1",
        reason: "Assign",
      };
      await controller.assignAsset("asset_1", dto, mockUserAdmin, mockReq);
      expect(service.assignAsset).toHaveBeenCalledWith(
        "asset_1",
        dto,
        "user_admin",
        {
          ipAddress: "127.0.0.1",
          requestId: "req_test",
          traceId: "trace_test",
          userAgent: "Vitest/1.0",
        },
      );
    });

    it("should delegate transferAsset to service", async () => {
      const dto = {
        toEmployeeId: "emp_2",
        toLocationId: "loc_2",
        reason: "Transfer",
      };
      await controller.transferAsset("asset_1", dto, mockUserAdmin, mockReq);
      expect(service.transferAsset).toHaveBeenCalledWith(
        "asset_1",
        dto,
        "user_admin",
        {
          ipAddress: "127.0.0.1",
          requestId: "req_test",
          traceId: "trace_test",
          userAgent: "Vitest/1.0",
        },
      );
    });

    it("should delegate returnAsset to service", async () => {
      const dto = { toLocationId: "loc_1", reason: "Return" };
      await controller.returnAsset("asset_1", dto, mockUserAdmin, mockReq);
      expect(service.returnAsset).toHaveBeenCalledWith(
        "asset_1",
        dto,
        "user_admin",
        {
          ipAddress: "127.0.0.1",
          requestId: "req_test",
          traceId: "trace_test",
          userAgent: "Vitest/1.0",
        },
      );
    });

    it("should delegate retireAsset to service", async () => {
      const dto = { reason: "Retire" };
      await controller.retireAsset("asset_1", dto, mockUserAdmin, mockReq);
      expect(service.retireAsset).toHaveBeenCalledWith(
        "asset_1",
        dto,
        "user_admin",
        {
          ipAddress: "127.0.0.1",
          requestId: "req_test",
          traceId: "trace_test",
          userAgent: "Vitest/1.0",
        },
      );
    });

    it("should delegate getAssetMovements to service", async () => {
      await controller.getAssetMovements("asset_1");
      expect(service.getAssetMovements).toHaveBeenCalledWith("asset_1");
    });
  });
});
