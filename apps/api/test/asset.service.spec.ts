import { describe, it, expect, vi, beforeEach } from "vitest";
import { AssetService } from "../src/modules/asset/services/AssetService.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { AssetStatus, MovementType } from "@veylix/types";
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";

type MockMethod = ReturnType<typeof vi.fn>;

describe("AssetService", () => {
  let assetService: AssetService;
  let mockPrisma: {
    asset: Record<string, MockMethod>;
    category: Record<string, MockMethod>;
    location: Record<string, MockMethod>;
    employee: Record<string, MockMethod>;
    assetMovement: Record<string, MockMethod>;
    $transaction: MockMethod;
    $queryRaw: MockMethod;
  };

  beforeEach(() => {
    mockPrisma = {
      asset: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      category: {
        findUnique: vi.fn(),
      },
      location: {
        findUnique: vi.fn(),
      },
      employee: {
        findUnique: vi.fn(),
      },
      assetMovement: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn((cb: (tx: typeof mockPrisma) => Promise<unknown>) =>
        cb(mockPrisma),
      ),
      $queryRaw: vi.fn(),
    };

    assetService = new AssetService(mockPrisma as unknown as PrismaService);
  });

  describe("listAssets", () => {
    it("should list assets with default pagination", async () => {
      mockPrisma.asset.findMany.mockResolvedValue([
        { id: "asset_1", name: "Laptop 1" },
      ]);
      mockPrisma.asset.count.mockResolvedValue(1);

      const result = await assetService.listAssets({});

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 25,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 25,
        }),
      );
    });

    it("should apply search filters across multiple fields", async () => {
      mockPrisma.asset.findMany.mockResolvedValue([]);
      mockPrisma.asset.count.mockResolvedValue(0);

      await assetService.listAssets({ search: "MacBook" });

      expect(mockPrisma.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: "MacBook", mode: "insensitive" } },
              { patrimonyNumber: { contains: "MacBook", mode: "insensitive" } },
            ]),
          }),
        }),
      );
    });
  });

  describe("getAssetById", () => {
    it("should return the asset when found", async () => {
      const mockAsset = { id: "asset_1", name: "Laptop 1" };
      mockPrisma.asset.findUnique.mockResolvedValue(mockAsset);

      const result = await assetService.getAssetById("asset_1");
      expect(result).toEqual(mockAsset);
    });

    it("should throw NotFoundException when asset is not found", async () => {
      mockPrisma.asset.findUnique.mockResolvedValue(null);

      await expect(assetService.getAssetById("non_existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("createAsset", () => {
    const createDto = {
      patrimonyNumber: "AST-2024-0001",
      name: "Dell XPS 15",
      categoryId: "cat_1",
      locationId: "loc_1",
      brand: "Dell",
      model: "XPS 15",
      purchaseDate: "2024-01-10",
      purchaseValue: 2500,
    };

    it("should create asset without employee assignment", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: "cat_1",
        isActive: true,
      });
      mockPrisma.location.findUnique.mockResolvedValue({
        id: "loc_1",
        isActive: true,
      });
      mockPrisma.asset.findUnique.mockResolvedValue(null);
      mockPrisma.asset.create.mockResolvedValue({
        id: "asset_new",
        ...createDto,
        status: AssetStatus.AVAILABLE,
      });

      const result = await assetService.createAsset(createDto, "user_admin");

      expect(result.id).toBe("asset_new");
      expect(mockPrisma.asset.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            patrimonyNumber: "AST-2024-0001",
            status: AssetStatus.AVAILABLE,
          }),
        }),
      );
      expect(mockPrisma.assetMovement.create).not.toHaveBeenCalled();
    });

    it("should create asset with employee assignment and initial movement", async () => {
      const dtoWithAssignee = {
        ...createDto,
        assignedEmployeeId: "emp_1",
      };

      mockPrisma.category.findUnique.mockResolvedValue({
        id: "cat_1",
        isActive: true,
      });
      mockPrisma.location.findUnique.mockResolvedValue({
        id: "loc_1",
        isActive: true,
      });
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: "emp_1",
        isActive: true,
      });
      mockPrisma.asset.findUnique.mockResolvedValue(null);
      mockPrisma.asset.create.mockResolvedValue({
        id: "asset_new",
        ...dtoWithAssignee,
        status: AssetStatus.IN_USE,
      });

      const result = await assetService.createAsset(
        dtoWithAssignee,
        "user_admin",
      );

      expect(result.id).toBe("asset_new");
      expect(mockPrisma.assetMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            toEmployeeId: "emp_1",
            movementType: MovementType.ASSIGNMENT,
          }),
        }),
      );
    });

    it("should throw ConflictException on duplicate patrimony number", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: "cat_1",
        isActive: true,
      });
      mockPrisma.location.findUnique.mockResolvedValue({
        id: "loc_1",
        isActive: true,
      });
      mockPrisma.asset.findUnique.mockResolvedValue({ id: "existing_asset" });

      await expect(
        assetService.createAsset(createDto, "user_admin"),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw BadRequestException if category is inactive", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: "cat_1",
        isActive: false,
      });

      await expect(
        assetService.createAsset(createDto, "user_admin"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateAsset (Optimistic Concurrency Control)", () => {
    it("should successfully update when version matches", async () => {
      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_1",
        name: "Updated Name",
        version: 2,
      });

      const result = await assetService.updateAsset("asset_1", {
        name: "Updated Name",
        version: 1,
      });

      expect(result.version).toBe(2);
      expect(mockPrisma.asset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            idx_assets_id_version: { id: "asset_1", version: 1 },
          },
        }),
      );
    });

    it("should throw ConflictException when version mismatch occurs (INV-007)", async () => {
      mockPrisma.asset.update.mockRejectedValue({ code: "P2025" });
      mockPrisma.asset.findUnique.mockResolvedValue({
        id: "asset_1",
        version: 2,
      });

      await expect(
        assetService.updateAsset("asset_1", {
          name: "Conflict Name",
          version: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("transferAsset", () => {
    it("should transfer asset between employees with atomic movement", async () => {
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
          id: "asset_1",
          status: AssetStatus.IN_USE,
          version: 1,
          location_id: "loc_1",
          assigned_employee_id: "emp_1",
        },
      ]);
      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_1",
        assignedEmployeeId: "emp_2",
        status: AssetStatus.IN_USE,
        version: 2,
      });
      mockPrisma.assetMovement.create.mockResolvedValue({
        id: "mov_1",
        movementNumber: "MOV-123",
      });

      const result = await assetService.transferAsset(
        "asset_1",
        {
          toEmployeeId: "emp_2",
          toLocationId: "loc_2",
          reason: "Team change",
        },
        "user_admin",
      );

      expect(result.asset.assignedEmployeeId).toBe("emp_2");
      expect(result.movement.movementNumber).toBe("MOV-123");
      expect(mockPrisma.assetMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromEmployeeId: "emp_1",
            toEmployeeId: "emp_2",
            movementType: MovementType.TRANSFER,
          }),
        }),
      );
    });
  });

  describe("returnAsset", () => {
    it("should return asset to inventory and clear custodian", async () => {
      mockPrisma.location.findUnique.mockResolvedValue({
        id: "loc_main",
        isActive: true,
      });
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_1",
          status: AssetStatus.IN_USE,
          version: 1,
          location_id: "loc_1",
          assigned_employee_id: "emp_1",
        },
      ]);
      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_1",
        assignedEmployeeId: null,
        status: AssetStatus.AVAILABLE,
        version: 2,
      });
      mockPrisma.assetMovement.create.mockResolvedValue({ id: "mov_ret" });

      const result = await assetService.returnAsset(
        "asset_1",
        {
          toLocationId: "loc_main",
          reason: "Offboarding",
        },
        "user_admin",
      );

      expect(result.asset.status).toBe(AssetStatus.AVAILABLE);
      expect(result.asset.assignedEmployeeId).toBeNull();
      expect(mockPrisma.assetMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromEmployeeId: "emp_1",
            toEmployeeId: null,
            movementType: MovementType.RETURN,
          }),
        }),
      );
    });
  });

  describe("retireAsset", () => {
    it("should retire asset permanently", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          id: "asset_1",
          status: AssetStatus.AVAILABLE,
          version: 2,
          location_id: "loc_1",
          assigned_employee_id: null,
        },
      ]);
      mockPrisma.asset.update.mockResolvedValue({
        id: "asset_1",
        status: AssetStatus.RETIRED,
        version: 3,
      });
      mockPrisma.assetMovement.create.mockResolvedValue({ id: "mov_retire" });

      const result = await assetService.retireAsset(
        "asset_1",
        {
          reason: "Damaged beyond repair",
        },
        "user_admin",
      );

      expect(result.asset.status).toBe(AssetStatus.RETIRED);
      expect(mockPrisma.assetMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            movementType: MovementType.RETIREMENT,
          }),
        }),
      );
    });
  });

  describe("getAssetMovements", () => {
    it("should return movements sorted by createdAt desc", async () => {
      mockPrisma.asset.findUnique.mockResolvedValue({ id: "asset_1" });
      mockPrisma.assetMovement.findMany.mockResolvedValue([
        { id: "mov_1", movementNumber: "MOV-1" },
      ]);

      const movements = await assetService.getAssetMovements("asset_1");
      expect(movements).toHaveLength(1);
      expect(mockPrisma.assetMovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assetId: "asset_1" },
          orderBy: { createdAt: "desc" },
        }),
      );
    });
  });
});
