import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Optional,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { AuditService } from "../../audit/audit.service.js";
import { AssetStateMachine } from "../domain/AssetStateMachine.js";
import { MovementType, AssetStatus } from "@veylix/types";
import {
  CreateAssetDto,
  UpdateAssetDto,
  QueryAssetDto,
  AssignAssetDto,
  TransferAssetDto,
  ReturnAssetDto,
  RetireAssetDto,
} from "../dto/index.js";
import { Prisma } from "@prisma/client";

interface AssetRawResult {
  id: string;
  status: AssetStatus;
  version: number;
  location_id: string;
  assigned_employee_id: string | null;
}

@Injectable()
export class AssetService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly auditService?: AuditService,
  ) {}

  /**
   * Generates a unique movement number.
   */
  private generateMovementNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MOV-${timestamp}-${random}`;
  }

  /**
   * Lists assets with pagination, multi-criteria filtering, and text search.
   */
  async listAssets(query: QueryAssetDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.locationId) {
      where.locationId = query.locationId;
    }
    if (query.assignedEmployeeId) {
      where.assignedEmployeeId = query.assignedEmployeeId;
    }

    if (query.search && query.search.trim() !== "") {
      const searchTerm = query.search.trim();
      where.OR = [
        { patrimonyNumber: { contains: searchTerm, mode: "insensitive" } },
        { name: { contains: searchTerm, mode: "insensitive" } },
        { serialNumber: { contains: searchTerm, mode: "insensitive" } },
        { brand: { contains: searchTerm, mode: "insensitive" } },
        { model: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.AssetOrderByWithRelationInput = { createdAt: "desc" };
    if (query.sort) {
      const [field, direction] = query.sort.split(":");
      const dir: Prisma.SortOrder =
        direction?.toLowerCase() === "asc" ? "asc" : "desc";

      if (field === "name") orderBy = { name: dir };
      else if (field === "patrimonyNumber") orderBy = { patrimonyNumber: dir };
      else if (field === "purchaseDate") orderBy = { purchaseDate: dir };
      else if (field === "purchaseValue") orderBy = { purchaseValue: dir };
      else if (field === "status") orderBy = { status: dir };
      else if (field === "updatedAt") orderBy = { updatedAt: dir };
      else orderBy = { createdAt: dir };
    }

    const [assets, totalItems] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          location: true,
          assignedEmployee: true,
        },
      }),
      this.prisma.asset.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data: assets,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Retrieves a single asset with full relation graphs.
   */
  async getAssetById(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        assignedEmployee: true,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID "${id}" not found`);
    }

    return asset;
  }

  /**
   * Creates a new physical asset, validating relations and creating initial assignment movement if applicable.
   */
  async createAsset(dto: CreateAssetDto, performedByUserId: string) {
    // Validate Category exists & active
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category || !category.isActive) {
      throw new BadRequestException("Category does not exist or is inactive");
    }

    // Validate Location exists & active
    const location = await this.prisma.location.findUnique({
      where: { id: dto.locationId },
    });
    if (!location || !location.isActive) {
      throw new BadRequestException("Location does not exist or is inactive");
    }

    // Validate Employee if assigned
    if (dto.assignedEmployeeId) {
      const employee = await this.prisma.employee.findUnique({
        where: { id: dto.assignedEmployeeId },
      });
      if (!employee || !employee.isActive) {
        throw new BadRequestException("Employee does not exist or is inactive");
      }
    }

    // Check duplicate patrimonyNumber
    const existing = await this.prisma.asset.findUnique({
      where: { patrimonyNumber: dto.patrimonyNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Asset with patrimony number "${dto.patrimonyNumber}" already exists`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const initialStatus = dto.assignedEmployeeId
        ? AssetStatus.IN_USE
        : (dto.status ?? AssetStatus.AVAILABLE);

      const asset = await tx.asset.create({
        data: {
          patrimonyNumber: dto.patrimonyNumber,
          name: dto.name,
          categoryId: dto.categoryId,
          locationId: dto.locationId,
          assignedEmployeeId: dto.assignedEmployeeId ?? null,
          brand: dto.brand,
          model: dto.model,
          serialNumber: dto.serialNumber ?? null,
          status: initialStatus,
          purchaseDate: new Date(dto.purchaseDate),
          purchaseValue: dto.purchaseValue,
          description: dto.description ?? null,
        },
        include: {
          category: true,
          location: true,
          assignedEmployee: true,
        },
      });

      if (dto.assignedEmployeeId) {
        await tx.assetMovement.create({
          data: {
            movementNumber: this.generateMovementNumber(),
            assetId: asset.id,
            fromEmployeeId: null,
            toEmployeeId: dto.assignedEmployeeId,
            fromLocationId: dto.locationId,
            toLocationId: dto.locationId,
            reason: "Initial assignment on asset creation",
            movementType: MovementType.ASSIGNMENT,
            performedByUserId,
          },
        });
      }

      if (this.auditService) {
        await this.auditService.logEvent(
          {
            eventName: "ASSET_CREATED",
            actorUserId: performedByUserId,
            resourceType: "Asset",
            resourceId: asset.id,
            changes: {
              patrimonyNumber: asset.patrimonyNumber,
              name: asset.name,
              status: asset.status,
            },
          },
          tx,
        );
      }

      return asset;
    });
  }

  /**
   * Updates asset descriptive fields guarded by optimistic concurrency locking (INV-007).
   */
  async updateAsset(id: string, dto: UpdateAssetDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category || !category.isActive) {
        throw new BadRequestException("Category does not exist or is inactive");
      }
    }

    try {
      return await this.prisma.asset.update({
        where: {
          idx_assets_id_version: {
            id,
            version: dto.version,
          },
        },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.brand !== undefined && { brand: dto.brand }),
          ...(dto.model !== undefined && { model: dto.model }),
          ...(dto.serialNumber !== undefined && {
            serialNumber: dto.serialNumber,
          }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.purchaseValue !== undefined && {
            purchaseValue: dto.purchaseValue,
          }),
          ...(dto.purchaseDate !== undefined && {
            purchaseDate: new Date(dto.purchaseDate),
          }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          version: dto.version + 1,
        },
        include: {
          category: true,
          location: true,
          assignedEmployee: true,
        },
      });
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2025") {
        const existing = await this.prisma.asset.findUnique({ where: { id } });
        if (!existing) {
          throw new NotFoundException(`Asset with ID "${id}" not found`);
        }
        throw new ConflictException(
          `Asset version conflict: expected version ${dto.version}, but current version is ${existing.version}. Please refresh.`,
        );
      }
      throw error;
    }
  }

  /**
   * Assigns an unassigned asset to an employee.
   * Enforces INV-001, INV-004, INV-007.
   */
  async assignAsset(
    assetId: string,
    dto: AssignAssetDto,
    performedByUserId: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.toEmployeeId },
    });
    if (!employee || !employee.isActive) {
      throw new BadRequestException(
        "Target employee does not exist or is inactive",
      );
    }

    const location = await this.prisma.location.findUnique({
      where: { id: dto.toLocationId },
    });
    if (!location || !location.isActive) {
      throw new BadRequestException(
        "Target location does not exist or is inactive",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new NotFoundException("Asset not found");
      }

      const asset = assets[0];

      // Domain invariant validation
      AssetStateMachine.canAssign(asset.status, !!asset.assigned_employee_id);

      const nextStatus = AssetStateMachine.getNextStatusForMovement(
        MovementType.ASSIGNMENT,
      );
      const newVersion = asset.version + 1;

      const updatedAsset = await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: assetId,
            version: asset.version,
          },
        },
        data: {
          assignedEmployeeId: dto.toEmployeeId,
          locationId: dto.toLocationId,
          status: nextStatus,
          version: newVersion,
        },
        include: {
          category: true,
          location: true,
          assignedEmployee: true,
        },
      });

      const movement = await tx.assetMovement.create({
        data: {
          movementNumber: this.generateMovementNumber(),
          assetId,
          fromEmployeeId: null,
          toEmployeeId: dto.toEmployeeId,
          fromLocationId: asset.location_id,
          toLocationId: dto.toLocationId,
          reason: dto.reason,
          movementType: MovementType.ASSIGNMENT,
          performedByUserId,
        },
      });

      if (this.auditService) {
        await this.auditService.logEvent(
          {
            eventName: "ASSET_ASSIGNED",
            actorUserId: performedByUserId,
            resourceType: "Asset",
            resourceId: assetId,
            changes: {
              toEmployeeId: dto.toEmployeeId,
              toLocationId: dto.toLocationId,
              reason: dto.reason,
            },
          },
          tx,
        );
      }

      return { asset: updatedAsset, movement };
    });
  }

  /**
   * Transfers an asset between employees.
   * Enforces INV-002, INV-003, INV-004, INV-007.
   */
  async transferAsset(
    assetId: string,
    dto: TransferAssetDto,
    performedByUserId: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: dto.toEmployeeId },
    });
    if (!employee || !employee.isActive) {
      throw new BadRequestException(
        "Target employee does not exist or is inactive",
      );
    }

    const location = await this.prisma.location.findUnique({
      where: { id: dto.toLocationId },
    });
    if (!location || !location.isActive) {
      throw new BadRequestException(
        "Target location does not exist or is inactive",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new NotFoundException("Asset not found");
      }

      const asset = assets[0];
      const fromEmployeeId = dto.fromEmployeeId ?? asset.assigned_employee_id;

      if (!fromEmployeeId) {
        throw new BadRequestException(
          "Asset is not assigned to any custodian. Use assign instead of transfer.",
        );
      }

      // Domain invariant validation
      AssetStateMachine.canTransfer(
        asset.status,
        asset.assigned_employee_id,
        fromEmployeeId,
        dto.toEmployeeId,
      );

      const nextStatus = AssetStateMachine.getNextStatusForMovement(
        MovementType.TRANSFER,
      );
      const newVersion = asset.version + 1;

      const updatedAsset = await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: assetId,
            version: asset.version,
          },
        },
        data: {
          assignedEmployeeId: dto.toEmployeeId,
          locationId: dto.toLocationId,
          status: nextStatus,
          version: newVersion,
        },
        include: {
          category: true,
          location: true,
          assignedEmployee: true,
        },
      });

      const movement = await tx.assetMovement.create({
        data: {
          movementNumber: this.generateMovementNumber(),
          assetId,
          fromEmployeeId,
          toEmployeeId: dto.toEmployeeId,
          fromLocationId: asset.location_id,
          toLocationId: dto.toLocationId,
          reason: dto.reason,
          movementType: MovementType.TRANSFER,
          performedByUserId,
        },
      });

      if (this.auditService) {
        await this.auditService.logEvent(
          {
            eventName: "ASSET_TRANSFERRED",
            actorUserId: performedByUserId,
            resourceType: "Asset",
            resourceId: assetId,
            changes: {
              fromEmployeeId,
              toEmployeeId: dto.toEmployeeId,
              toLocationId: dto.toLocationId,
              reason: dto.reason,
            },
          },
          tx,
        );
      }

      return { asset: updatedAsset, movement };
    });
  }

  /**
   * Returns an asset from employee custody back into available inventory.
   * Enforces INV-002, INV-003, INV-004, INV-007.
   */
  async returnAsset(
    assetId: string,
    dto: ReturnAssetDto,
    performedByUserId: string,
  ) {
    const location = await this.prisma.location.findUnique({
      where: { id: dto.toLocationId },
    });
    if (!location || !location.isActive) {
      throw new BadRequestException(
        "Target location does not exist or is inactive",
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new NotFoundException("Asset not found");
      }

      const asset = assets[0];

      // Domain invariant validation
      AssetStateMachine.canReturn(asset.status, asset.assigned_employee_id);

      const nextStatus = AssetStateMachine.getNextStatusForMovement(
        MovementType.RETURN,
      );
      const newVersion = asset.version + 1;
      const previousEmployeeId = asset.assigned_employee_id;

      const updatedAsset = await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: assetId,
            version: asset.version,
          },
        },
        data: {
          assignedEmployeeId: null,
          locationId: dto.toLocationId,
          status: nextStatus,
          version: newVersion,
        },
        include: {
          category: true,
          location: true,
          assignedEmployee: true,
        },
      });

      const movement = await tx.assetMovement.create({
        data: {
          movementNumber: this.generateMovementNumber(),
          assetId,
          fromEmployeeId: previousEmployeeId,
          toEmployeeId: null,
          fromLocationId: asset.location_id,
          toLocationId: dto.toLocationId,
          reason: dto.reason,
          movementType: MovementType.RETURN,
          performedByUserId,
        },
      });

      if (this.auditService) {
        await this.auditService.logEvent(
          {
            eventName: "ASSET_RETURNED",
            actorUserId: performedByUserId,
            resourceType: "Asset",
            resourceId: assetId,
            changes: {
              fromEmployeeId: previousEmployeeId,
              toLocationId: dto.toLocationId,
              reason: dto.reason,
            },
          },
          tx,
        );
      }

      return { asset: updatedAsset, movement };
    });
  }

  /**
   * Retires an asset permanently from active service.
   * Enforces INV-002, INV-003, INV-004, INV-007.
   */
  async retireAsset(
    assetId: string,
    dto: RetireAssetDto,
    performedByUserId: string,
  ) {
    if (dto.toLocationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: dto.toLocationId },
      });
      if (!location || !location.isActive) {
        throw new BadRequestException(
          "Target location does not exist or is inactive",
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new NotFoundException("Asset not found");
      }

      const asset = assets[0];

      // Domain invariant validation
      AssetStateMachine.canRetire(asset.status);

      const targetLocationId = dto.toLocationId ?? asset.location_id;
      const nextStatus = AssetStateMachine.getNextStatusForMovement(
        MovementType.RETIREMENT,
      );
      const newVersion = asset.version + 1;
      const previousEmployeeId = asset.assigned_employee_id;

      const updatedAsset = await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: assetId,
            version: asset.version,
          },
        },
        data: {
          assignedEmployeeId: null,
          locationId: targetLocationId,
          status: nextStatus,
          version: newVersion,
        },
        include: {
          category: true,
          location: true,
          assignedEmployee: true,
        },
      });

      const movement = await tx.assetMovement.create({
        data: {
          movementNumber: this.generateMovementNumber(),
          assetId,
          fromEmployeeId: previousEmployeeId,
          toEmployeeId: null,
          fromLocationId: asset.location_id,
          toLocationId: targetLocationId,
          reason: dto.reason,
          movementType: MovementType.RETIREMENT,
          performedByUserId,
        },
      });

      if (this.auditService) {
        await this.auditService.logEvent(
          {
            eventName: "ASSET_RETIRED",
            actorUserId: performedByUserId,
            resourceType: "Asset",
            resourceId: assetId,
            changes: {
              fromEmployeeId: previousEmployeeId,
              targetLocationId,
              reason: dto.reason,
            },
          },
          tx,
        );
      }

      return { asset: updatedAsset, movement };
    });
  }

  /**
   * Retrieves the full immutable movement audit trail for an asset.
   */
  async getAssetMovements(assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID "${assetId}" not found`);
    }

    return this.prisma.assetMovement.findMany({
      where: { assetId },
      orderBy: { createdAt: "desc" },
      include: {
        fromEmployee: true,
        toEmployee: true,
        fromLocation: true,
        toLocation: true,
        performedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
