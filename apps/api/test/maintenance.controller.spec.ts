import { describe, it, expect, vi, beforeEach } from "vitest";
import { MaintenanceController } from "../src/modules/maintenance/maintenance.controller.js";
import { MaintenanceService } from "../src/modules/maintenance/maintenance.service.js";
import { RolesGuard } from "../src/common/guards/roles.guard.js";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@veylix/types";
import { ForbiddenException, ExecutionContext } from "@nestjs/common";
import { VeylixRequest } from "../src/common/middleware/request-id.middleware.js";

describe("MaintenanceController (RBAC & Controller Delegations)", () => {
  let controller: MaintenanceController;
  let service: MaintenanceService;
  let rolesGuard: RolesGuard;

  const mockAdmin = {
    id: "user_admin",
    email: "admin@veylix.corp",
    name: "Admin",
    role: UserRole.ADMIN,
  };

  const mockOperator = {
    id: "user_op",
    email: "op@veylix.corp",
    name: "Operator",
    role: UserRole.OPERATOR,
  };

  const mockViewer = {
    id: "user_viewer",
    email: "viewer@veylix.corp",
    name: "Viewer",
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
      openMaintenance: vi.fn(),
      listMaintenance: vi.fn(),
      getMaintenanceById: vi.fn(),
      updateMaintenance: vi.fn(),
      closeMaintenance: vi.fn(),
      cancelMaintenance: vi.fn(),
    } as unknown as MaintenanceService;

    controller = new MaintenanceController(service);
    const reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(
    handler: (...args: never[]) => unknown,
    user: unknown,
  ): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => MaintenanceController,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  describe("RBAC Authorization Tests (Positive and Negative)", () => {
    describe("POST /api/maintenance (openMaintenance)", () => {
      it("should allow ADMIN to open maintenance", () => {
        const ctx = createMockExecutionContext(
          controller.openMaintenance,
          mockAdmin,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should allow OPERATOR to open maintenance", () => {
        const ctx = createMockExecutionContext(
          controller.openMaintenance,
          mockOperator,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should forbid VIEWER from opening maintenance (Negative Auth)", () => {
        const ctx = createMockExecutionContext(
          controller.openMaintenance,
          mockViewer,
        );
        expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe("POST /api/maintenance/:id/close (closeMaintenance)", () => {
      it("should allow ADMIN to close maintenance", () => {
        const ctx = createMockExecutionContext(
          controller.closeMaintenance,
          mockAdmin,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should allow OPERATOR to close maintenance", () => {
        const ctx = createMockExecutionContext(
          controller.closeMaintenance,
          mockOperator,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should forbid VIEWER from closing maintenance", () => {
        const ctx = createMockExecutionContext(
          controller.closeMaintenance,
          mockViewer,
        );
        expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe("POST /api/maintenance/:id/cancel (cancelMaintenance)", () => {
      it("should allow OPERATOR to cancel maintenance", () => {
        const ctx = createMockExecutionContext(
          controller.cancelMaintenance,
          mockOperator,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });

      it("should forbid VIEWER from cancelling maintenance", () => {
        const ctx = createMockExecutionContext(
          controller.cancelMaintenance,
          mockViewer,
        );
        expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
      });
    });

    describe("GET /api/maintenance (listMaintenance)", () => {
      it("should allow VIEWER to list maintenance work orders", () => {
        const ctx = createMockExecutionContext(
          controller.listMaintenance,
          mockViewer,
        );
        expect(rolesGuard.canActivate(ctx)).toBe(true);
      });
    });
  });

  describe("Controller Delegations", () => {
    it("should delegate openMaintenance to service with audit metadata", async () => {
      const dto = { assetId: "ast_1", title: "Fix", description: "Details" };
      await controller.openMaintenance(dto, mockAdmin, mockReq);

      expect(service.openMaintenance).toHaveBeenCalledWith(
        dto,
        "user_admin",
        expect.objectContaining({
          requestId: "req_test",
          traceId: "trace_test",
        }),
      );
    });

    it("should delegate listMaintenance to service", async () => {
      const query = { page: 1, limit: 10 };
      await controller.listMaintenance(query);
      expect(service.listMaintenance).toHaveBeenCalledWith(query);
    });

    it("should delegate getMaintenanceById to service", async () => {
      await controller.getMaintenanceById("mnt_1");
      expect(service.getMaintenanceById).toHaveBeenCalledWith("mnt_1");
    });

    it("should delegate updateMaintenance to service", async () => {
      const dto = { title: "Updated" };
      await controller.updateMaintenance("mnt_1", dto, mockOperator, mockReq);
      expect(service.updateMaintenance).toHaveBeenCalledWith(
        "mnt_1",
        dto,
        "user_op",
        expect.anything(),
      );
    });

    it("should delegate closeMaintenance to service", async () => {
      const dto = { resolutionNotes: "Done", cost: 100 };
      await controller.closeMaintenance("mnt_1", dto, mockAdmin, mockReq);
      expect(service.closeMaintenance).toHaveBeenCalledWith(
        "mnt_1",
        dto,
        "user_admin",
        expect.anything(),
      );
    });

    it("should delegate cancelMaintenance to service", async () => {
      const dto = { reason: "Not needed" };
      await controller.cancelMaintenance("mnt_1", dto, mockAdmin, mockReq);
      expect(service.cancelMaintenance).toHaveBeenCalledWith(
        "mnt_1",
        dto,
        "user_admin",
        expect.anything(),
      );
    });
  });
});
