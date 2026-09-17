import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssetService } from "../src/modules/asset/services/AssetService.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { AssetStatus } from "@veylix/types";
import { DomainError } from "../src/modules/asset/domain/AssetStateMachine.js";

describe("Concurrency, Optimistic Locking & Race Conditions (INV-001, INV-004, INV-007)", () => {
  let assetService: AssetService;
  let mockPrisma: {
    asset: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    employee: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    location: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    assetMovement: {
      create: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
    $queryRaw: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPrisma = {
      asset: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      employee: {
        findUnique: vi.fn(),
      },
      location: {
        findUnique: vi.fn(),
      },
      assetMovement: {
        create: vi.fn(),
      },
      $transaction: vi.fn((cb: (tx: typeof mockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      ),
      $queryRaw: vi.fn(),
    };

    assetService = new AssetService(mockPrisma as unknown as PrismaService);
  });

  describe("Optimistic Concurrency Control (updateAsset)", () => {
    it("should throw ConflictException (409) when version mismatch occurs (P2025 error)", async () => {
      // Asset in DB is already at version 3
      mockPrisma.asset.findUnique.mockResolvedValue({
        id: "asset_1",
        version: 3,
        name: "Laptops Pro",
      });

      // Update attempt with stale version 2 fails in Prisma
      const prismaP2025Error = new Error("Record to update not found");
      (prismaP2025Error as unknown as { code: string }).code = "P2025";
      mockPrisma.asset.update.mockRejectedValue(prismaP2025Error);

      await expect(
        assetService.updateAsset(
          "asset_1",
          { name: "Updated Name", version: 2 },
          "usr_editor",
        ),
      ).rejects.toThrow(ConflictException);

      await expect(
        assetService.updateAsset(
          "asset_1",
          { name: "Updated Name", version: 2 },
          "usr_editor",
        ),
      ).rejects.toThrow(
        /Asset version conflict: expected version 2, but current version is 3/,
      );
    });

    it("should throw NotFoundException when P2025 occurs and asset no longer exists in DB", async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      const prismaP2025Error = new Error("Record to update not found");
      (prismaP2025Error as unknown as { code: string }).code = "P2025";
      mockPrisma.asset.update.mockRejectedValue(prismaP2025Error);

      await expect(
        assetService.updateAsset(
          "asset_nonexistent",
          { name: "Updated", version: 1 },
          "usr_editor",
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("Pessimistic Row Locking in Transactions (INV-007)", () => {
    it("assignAsset locks row using SELECT FOR UPDATE and increments version counter", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: "emp_target",
        isActive: true,
      });
      mockPrisma.location.findUnique.mockResolvedValue({
        id: "loc_target",
        isActive: true,
      });

      // Raw query returns row locked with FOR UPDATE
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_10",
          status: AssetStatus.AVAILABLE,
          version: 5,
          location_id: "loc_old",
          assigned_employee_id: null,
        },
      ]);

      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_10",
        status: AssetStatus.IN_USE,
        version: 6,
      });
      mockPrisma.assetMovement.create.mockResolvedValue({ id: "mov_1" });

      const result = await assetService.assignAsset(
        "asset_10",
        {
          toEmployeeId: "emp_target",
          toLocationId: "loc_target",
          reason: "New hire",
        },
        "usr_operator",
      );

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      expect(mockPrisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            idx_assets_id_version: {
              id: "asset_10",
              version: 5,
            },
          },
          data: expect.objectContaining({
            version: 6,
            status: AssetStatus.IN_USE,
            assignedEmployeeId: "emp_target",
          }),
        }),
      );
      expect(result.asset.version).toBe(6);
    });

    it("transferAsset locks row using SELECT FOR UPDATE and increments version counter", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: "emp_2",
        isActive: true,
      });
      mockPrisma.location.findUnique.mockResolvedValue({
        id: "loc_2",
        isActive: true,
      });

      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_10",
          status: AssetStatus.IN_USE,
          version: 6,
          location_id: "loc_target",
          assigned_employee_id: "emp_1",
        },
      ]);

      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_10",
        status: AssetStatus.IN_USE,
        version: 7,
      });
      mockPrisma.assetMovement.create.mockResolvedValue({ id: "mov_2" });

      await assetService.transferAsset(
        "asset_10",
        {
          toEmployeeId: "emp_2",
          toLocationId: "loc_2",
          reason: "Transfer to new team",
        },
        "usr_operator",
      );

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            idx_assets_id_version: {
              id: "asset_10",
              version: 6,
            },
          },
          data: expect.objectContaining({
            version: 7,
            assignedEmployeeId: "emp_2",
          }),
        }),
      );
    });
  });

  describe("Race Conditions & Invariant Protection (INV-001, INV-003, INV-004)", () => {
    it("race condition: two simultaneous transfers for same asset - second transfer rejected due to custodian change", async () => {
      // Setup active employees & locations
      mockPrisma.employee.findUnique.mockImplementation(
        async ({ where: { id } }: { where: { id: string } }) => ({
          id,
          isActive: true,
        }),
      );
      mockPrisma.location.findUnique.mockResolvedValue({
        id: "loc_any",
        isActive: true,
      });

      // Simulation of sequential execution guaranteed by postgres row lock (SELECT FOR UPDATE)
      // Transaction 1 executes first: asset was assigned to emp_1
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        {
          id: "asset_race",
          status: AssetStatus.IN_USE,
          version: 1,
          location_id: "loc_1",
          assigned_employee_id: "emp_1",
        },
      ]);

      mockPrisma.asset.update.mockResolvedValueOnce({
        id: "asset_race",
        status: AssetStatus.IN_USE,
        version: 2,
        assignedEmployeeId: "emp_winner",
      });
      mockPrisma.assetMovement.create.mockResolvedValueOnce({
        id: "mov_winner",
      });

      // Transaction 1 succeeds
      const result1 = await assetService.transferAsset(
        "asset_race",
        {
          fromEmployeeId: "emp_1",
          toEmployeeId: "emp_winner",
          toLocationId: "loc_any",
          reason: "First transfer",
        },
        "usr_op1",
      );
      expect(result1.asset.version).toBe(2);

      // Now Transaction 2 acquires lock: asset is now assigned to emp_winner, version 2
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        {
          id: "asset_race",
          status: AssetStatus.IN_USE,
          version: 2,
          location_id: "loc_any",
          assigned_employee_id: "emp_winner",
        },
      ]);

      // Transaction 2 tries to transfer from emp_1 (which was valid when client submitted, but stale now)
      await expect(
        assetService.transferAsset(
          "asset_race",
          {
            fromEmployeeId: "emp_1",
            toEmployeeId: "emp_loser",
            toLocationId: "loc_any",
            reason: "Concurrent competing transfer",
          },
          "usr_op2",
        ),
      ).rejects.toThrow(
        new DomainError(
          "Asset is not currently assigned to the specified employee.",
        ),
      );
    });

    it("race condition: asset sent to MAINTENANCE blocks concurrent transfer attempt (INV-003)", async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: "emp_target",
        isActive: true,
      });
      mockPrisma.location.findUnique.mockResolvedValue({
        id: "loc_any",
        isActive: true,
      });

      // When transfer acquires lock, maintenance was just initiated so status is MAINTENANCE
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_maint",
          status: AssetStatus.MAINTENANCE,
          version: 3,
          location_id: "loc_lab",
          assigned_employee_id: "emp_1",
        },
      ]);

      await expect(
        assetService.transferAsset(
          "asset_maint",
          {
            toEmployeeId: "emp_target",
            toLocationId: "loc_any",
            reason: "Transfer attempt while under repair",
          },
          "usr_op",
        ),
      ).rejects.toThrow(
        new DomainError(
          "Cannot transfer an asset that is currently in maintenance.",
        ),
      );
    });
  });
});
