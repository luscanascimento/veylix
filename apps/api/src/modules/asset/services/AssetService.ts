import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AssetStateMachine, DomainError } from "../domain/AssetStateMachine";
import { MovementType, AssetStatus } from "@veylix/types";

interface AssignAssetDto {
  assetId: string;
  toEmployeeId: string;
  toLocationId: string;
  performedByUserId: string;
  reason: string;
}

interface TransferAssetDto {
  assetId: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  toLocationId: string;
  performedByUserId: string;
  reason: string;
}

interface AssetRawResult {
  id: string;
  status: AssetStatus;
  version: number;
  location_id: string;
  assigned_employee_id: string | null;
}

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique movement number.
   */
  private generateMovementNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MOV-${timestamp}-${random}`;
  }

  /**
   * Assigns an asset to an employee.
   * Enforces INV-001, INV-004, INV-007.
   */
  async assignAsset(dto: AssignAssetDto) {
    return this.prisma.$transaction(async (tx) => {
      // Pessimistic lock (INV-007)
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${dto.assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new DomainError("Asset not found");
      }

      const asset = assets[0];

      // Validate Domain Invariants
      AssetStateMachine.canAssign(asset.status, !!asset.assigned_employee_id);

      const nextStatus = AssetStateMachine.getNextStatusForMovement(
        MovementType.ASSIGNMENT,
      );
      const newVersion = asset.version + 1;

      // Optimistic lock (INV-007)
      const updatedAsset = await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: dto.assetId,
            version: asset.version,
          },
        },
        data: {
          assignedEmployeeId: dto.toEmployeeId,
          locationId: dto.toLocationId,
          status: nextStatus,
          version: newVersion,
        },
      });

      // Exactly one immutable AssetMovement record (INV-004)
      const movement = await tx.assetMovement.create({
        data: {
          movementNumber: this.generateMovementNumber(),
          assetId: dto.assetId,
          fromEmployeeId: null,
          toEmployeeId: dto.toEmployeeId,
          fromLocationId: asset.location_id,
          toLocationId: dto.toLocationId,
          reason: dto.reason,
          movementType: MovementType.ASSIGNMENT,
          performedByUserId: dto.performedByUserId,
        },
      });

      return { asset: updatedAsset, movement };
    });
  }

  /**
   * Transfers an asset between employees.
   */
  async transferAsset(dto: TransferAssetDto) {
    return this.prisma.$transaction(async (tx) => {
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${dto.assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new DomainError("Asset not found");
      }

      const asset = assets[0];

      // Validate Domain Invariants
      AssetStateMachine.canTransfer(
        asset.status,
        asset.assigned_employee_id,
        dto.fromEmployeeId,
        dto.toEmployeeId,
      );

      const nextStatus = AssetStateMachine.getNextStatusForMovement(
        MovementType.TRANSFER,
      );
      const newVersion = asset.version + 1;

      const updatedAsset = await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: dto.assetId,
            version: asset.version,
          },
        },
        data: {
          assignedEmployeeId: dto.toEmployeeId,
          locationId: dto.toLocationId,
          status: nextStatus,
          version: newVersion,
        },
      });

      const movement = await tx.assetMovement.create({
        data: {
          movementNumber: this.generateMovementNumber(),
          assetId: dto.assetId,
          fromEmployeeId: dto.fromEmployeeId,
          toEmployeeId: dto.toEmployeeId,
          fromLocationId: asset.location_id,
          toLocationId: dto.toLocationId,
          reason: dto.reason,
          movementType: MovementType.TRANSFER,
          performedByUserId: dto.performedByUserId,
        },
      });

      return { asset: updatedAsset, movement };
    });
  }
}
