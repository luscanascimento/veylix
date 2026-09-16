import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuditService } from "../src/modules/audit/audit.service.js";
import { AuditController } from "../src/modules/audit/audit.controller.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { RolesGuard } from "../src/common/guards/roles.guard.js";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@veylix/types";
import { ForbiddenException, ExecutionContext } from "@nestjs/common";

type MockMethod = ReturnType<typeof vi.fn>;

describe("AuditModule (INV-005)", () => {
  let auditService: AuditService;
  let auditController: AuditController;
  let mockPrisma: {
    auditLog: Record<string, MockMethod>;
  };
  let rolesGuard: RolesGuard;

  const mockAdmin = { id: "u_admin", role: UserRole.ADMIN };
  const mockOperator = { id: "u_op", role: UserRole.OPERATOR };
  const mockViewer = { id: "u_viewer", role: UserRole.VIEWER };

  beforeEach(() => {
    mockPrisma = {
      auditLog: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    auditService = new AuditService(mockPrisma as unknown as PrismaService);
    auditController = new AuditController(auditService);
    const reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
  });

  function createMockExecutionContext(
    handler: (...args: never[]) => unknown,
    user: unknown,
  ): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => AuditController,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  describe("AuditService.logEvent", () => {
    it("should create an immutable audit record with full metadata (INV-005)", async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: "audit_1" });

      await auditService.logEvent({
        eventName: "TEST_EVENT",
        actorUserId: "user_1",
        ipAddress: "192.168.1.1",
        userAgent: "Agent/1.0",
        requestId: "req_1",
        traceId: "trace_1",
        resourceType: "Asset",
        resourceId: "ast_1",
        changes: { field: "value" },
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventName: "TEST_EVENT",
            actorUserId: "user_1",
            ipAddress: "192.168.1.1",
            resourceType: "Asset",
            resourceId: "ast_1",
          }),
        }),
      );
    });
  });

  describe("AuditService.listAuditLogs", () => {
    it("should list audit logs with pagination and filters", async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([{ id: "audit_1" }]);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      const result = await auditService.listAuditLogs({
        page: 1,
        limit: 20,
        resourceType: "Asset",
        fromDate: "2024-01-01T00:00:00.000Z",
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe("AuditController RBAC", () => {
    it("should allow ADMIN to read audit logs", () => {
      const ctx = createMockExecutionContext(
        auditController.listAuditLogs,
        mockAdmin,
      );
      expect(rolesGuard.canActivate(ctx)).toBe(true);
    });

    it("should allow OPERATOR to read audit logs", () => {
      const ctx = createMockExecutionContext(
        auditController.listAuditLogs,
        mockOperator,
      );
      expect(rolesGuard.canActivate(ctx)).toBe(true);
    });

    it("should forbid VIEWER from reading audit logs (Negative Auth)", () => {
      const ctx = createMockExecutionContext(
        auditController.listAuditLogs,
        mockViewer,
      );
      expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });
});
