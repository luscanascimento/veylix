import { describe, it, expect, vi, beforeEach } from "vitest";
import { MaintenanceService } from "../src/modules/maintenance/maintenance.service.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { AuditService } from "../src/modules/audit/audit.service.js";
import {
  AssetStatus,
  MaintenanceStatus,
  MaintenancePriority,
} from "@veylix/types";
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";

type MockMethod = ReturnType<typeof vi.fn>;

describe("MaintenanceService (INV-003, INV-005, INV-006, INV-007)", () => {
  let maintenanceService: MaintenanceService;
  let mockPrisma: {
    asset: Record<string, MockMethod>;
    maintenance: Record<string, MockMethod>;
    auditLog: Record<string, MockMethod>;
    $transaction: MockMethod;
    $queryRaw: MockMethod;
  };
  let mockAuditService: {
    logEvent: MockMethod;
  };

  beforeEach(() => {
    mockPrisma = {
      asset: {
        update: vi.fn(),
        findUnique: vi.fn(),
      },
      maintenance: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      auditLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn((cb: (tx: typeof mockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      ),
      $queryRaw: vi.fn(),
    };

    mockAuditService = {
      logEvent: vi.fn().mockResolvedValue({ id: "audit_1" }),
    };

    maintenanceService = new MaintenanceService(
      mockPrisma as unknown as PrismaService,
      mockAuditService as unknown as AuditService,
    );
  });

  describe("openMaintenance", () => {
    it("should atomically transition asset to MAINTENANCE and record audit log (INV-005, INV-006, INV-007)", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_1",
          status: AssetStatus.AVAILABLE,
          version: 1,
          location_id: "loc_1",
          assigned_employee_id: null,
        },
      ]);
      mockPrisma.maintenance.findFirst.mockResolvedValue(null);
      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_1",
        status: AssetStatus.MAINTENANCE,
        version: 2,
      });
      mockPrisma.maintenance.create.mockResolvedValue({
        id: "mnt_1",
        ticketNumber: "MNT-123",
        assetId: "asset_1",
        status: MaintenanceStatus.OPEN,
      });

      const result = await maintenanceService.openMaintenance(
        {
          assetId: "asset_1",
          title: "Screen broken",
          description: "Cracked glass",
          priority: MaintenancePriority.HIGH,
        },
        "user_admin",
        { ipAddress: "127.0.0.1", requestId: "req_1" },
      );

      expect(result.id).toBe("mnt_1");
      expect(mockPrisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idx_assets_id_version: { id: "asset_1", version: 1 } },
          data: { status: AssetStatus.MAINTENANCE, version: 2 },
        }),
      );
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: "MAINTENANCE_OPENED",
          actorUserId: "user_admin",
          resourceType: "Maintenance",
          resourceId: "mnt_1",
        }),
        expect.anything(),
      );
    });

    it("should throw NotFoundException if asset does not exist", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await expect(
        maintenanceService.openMaintenance(
          {
            assetId: "non_existent",
            title: "Fix",
            description: "Details",
          },
          "user_admin",
          {},
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if asset already has an active ticket", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_1",
          status: AssetStatus.AVAILABLE,
          version: 1,
        },
      ]);
      mockPrisma.maintenance.findFirst.mockResolvedValue({
        id: "mnt_existing",
        ticketNumber: "MNT-ACTIVE-01",
      });

      await expect(
        maintenanceService.openMaintenance(
          {
            assetId: "asset_1",
            title: "Fix",
            description: "Details",
          },
          "user_admin",
          {},
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("listMaintenance", () => {
    it("should return paginated tickets", async () => {
      mockPrisma.maintenance.findMany.mockResolvedValue([
        { id: "mnt_1", ticketNumber: "MNT-001" },
      ]);
      mockPrisma.maintenance.count.mockResolvedValue(1);

      const result = await maintenanceService.listMaintenance({
        page: 1,
        limit: 10,
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("getMaintenanceById", () => {
    it("should return ticket when found", async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue({
        id: "mnt_1",
        ticketNumber: "MNT-001",
      });

      const ticket = await maintenanceService.getMaintenanceById("mnt_1");
      expect(ticket.id).toBe("mnt_1");
    });

    it("should throw NotFoundException when ticket not found", async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue(null);

      await expect(
        maintenanceService.getMaintenanceById("unknown"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateMaintenance", () => {
    it("should update open ticket and log audit event (INV-005)", async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue({
        id: "mnt_1",
        status: MaintenanceStatus.OPEN,
      });
      mockPrisma.maintenance.update.mockResolvedValue({
        id: "mnt_1",
        status: MaintenanceStatus.IN_PROGRESS,
        cost: 50,
      });

      const result = await maintenanceService.updateMaintenance(
        "mnt_1",
        { status: MaintenanceStatus.IN_PROGRESS, cost: 50 },
        "user_op",
        { requestId: "req_2" },
      );

      expect(result.status).toBe(MaintenanceStatus.IN_PROGRESS);
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: "MAINTENANCE_UPDATED",
          actorUserId: "user_op",
          resourceId: "mnt_1",
        }),
      );
    });

    it("should throw BadRequestException when updating a completed ticket", async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue({
        id: "mnt_1",
        status: MaintenanceStatus.COMPLETED,
      });

      await expect(
        maintenanceService.updateMaintenance(
          "mnt_1",
          { title: "New Title" },
          "user_op",
          {},
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("closeMaintenance", () => {
    it("should restore asset status to IN_USE if asset has employee custodian (INV-006)", async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue({
        id: "mnt_1",
        assetId: "asset_1",
        status: MaintenanceStatus.IN_PROGRESS,
      });
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_1",
          status: AssetStatus.MAINTENANCE,
          version: 2,
          assigned_employee_id: "emp_1",
        },
      ]);
      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_1",
        status: AssetStatus.IN_USE,
        version: 3,
      });
      mockPrisma.maintenance.update.mockResolvedValue({
        id: "mnt_1",
        status: MaintenanceStatus.COMPLETED,
        resolutionNotes: "Fixed screen",
      });

      const result = await maintenanceService.closeMaintenance(
        "mnt_1",
        { resolutionNotes: "Fixed screen", cost: 120 },
        "user_admin",
        { requestId: "req_3" },
      );

      expect(result.status).toBe(MaintenanceStatus.COMPLETED);
      expect(mockPrisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idx_assets_id_version: { id: "asset_1", version: 2 } },
          data: { status: AssetStatus.IN_USE, version: 3 },
        }),
      );
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: "MAINTENANCE_CLOSED",
          actorUserId: "user_admin",
          resourceId: "mnt_1",
        }),
        expect.anything(),
      );
    });

    it("should restore asset status to AVAILABLE if asset has no employee custodian (INV-006)", async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue({
        id: "mnt_1",
        assetId: "asset_1",
        status: MaintenanceStatus.OPEN,
      });
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_1",
          status: AssetStatus.MAINTENANCE,
          version: 2,
          assigned_employee_id: null,
        },
      ]);
      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_1",
        status: AssetStatus.AVAILABLE,
        version: 3,
      });
      mockPrisma.maintenance.update.mockResolvedValue({
        id: "mnt_1",
        status: MaintenanceStatus.COMPLETED,
      });

      await maintenanceService.closeMaintenance(
        "mnt_1",
        { resolutionNotes: "Inspected OK" },
        "user_admin",
        {},
      );

      expect(mockPrisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: AssetStatus.AVAILABLE, version: 3 },
        }),
      );
    });
  });

  describe("cancelMaintenance", () => {
    it("should cancel ticket and restore asset status (INV-006)", async () => {
      mockPrisma.maintenance.findUnique.mockResolvedValue({
        id: "mnt_1",
        assetId: "asset_1",
        status: MaintenanceStatus.OPEN,
      });
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_1",
          status: AssetStatus.MAINTENANCE,
          version: 2,
          assigned_employee_id: "emp_1",
        },
      ]);
      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_1",
        status: AssetStatus.IN_USE,
        version: 3,
      });
      mockPrisma.maintenance.update.mockResolvedValue({
        id: "mnt_1",
        status: MaintenanceStatus.CANCELLED,
      });

      const result = await maintenanceService.cancelMaintenance(
        "mnt_1",
        { reason: "User cancelled" },
        "user_admin",
        {},
      );

      expect(result.status).toBe(MaintenanceStatus.CANCELLED);
      expect(mockPrisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: AssetStatus.IN_USE, version: 3 },
        }),
      );
      expect(mockAuditService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: "MAINTENANCE_CANCELLED",
        }),
        expect.anything(),
      );
    });
  });
});
