import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuditService } from "../audit/audit.service.js";
import { AssetStateMachine } from "../asset/domain/AssetStateMachine.js";
import {
  AssetStatus,
  MaintenanceStatus,
  MaintenancePriority,
} from "@veylix/types";
import {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  CloseMaintenanceDto,
  CancelMaintenanceDto,
  QueryMaintenanceDto,
} from "./dto/index.js";
import { Prisma } from "@prisma/client";

interface AssetRawResult {
  id: string;
  status: AssetStatus;
  version: number;
  location_id: string;
  assigned_employee_id: string | null;
}

export interface RequestAuditMeta {
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  traceId?: string;
}

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Generates a deterministic unique maintenance work order number.
   */
  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MNT-${timestamp}-${random}`;
  }

  /**
   * Opens a new maintenance work order.
   * Atomically sets asset status to MAINTENANCE, checks invariants (INV-003, INV-006, INV-007),
   * and records an immutable AuditLog (INV-005).
   */
  async openMaintenance(
    dto: CreateMaintenanceDto,
    userId: string,
    meta: RequestAuditMeta,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Pessimistic lock on asset (INV-007)
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${dto.assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new NotFoundException(`Asset with ID "${dto.assetId}" not found`);
      }

      const asset = assets[0];

      // Domain invariant checks (INV-002, INV-006)
      AssetStateMachine.canStartMaintenance(asset.status);

      // Check for any existing open/in-progress ticket on this asset
      const activeTicket = await tx.maintenance.findFirst({
        where: {
          assetId: dto.assetId,
          status: {
            in: [MaintenanceStatus.OPEN, MaintenanceStatus.IN_PROGRESS],
          },
        },
      });

      if (activeTicket) {
        throw new ConflictException(
          `Asset already has an active maintenance ticket (${activeTicket.ticketNumber})`,
        );
      }

      const ticketNumber = this.generateTicketNumber();
      const newVersion = asset.version + 1;

      // Update asset state machine to MAINTENANCE (INV-006)
      await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: dto.assetId,
            version: asset.version,
          },
        },
        data: {
          status: AssetStatus.MAINTENANCE,
          version: newVersion,
        },
      });

      const ticket = await tx.maintenance.create({
        data: {
          ticketNumber,
          assetId: dto.assetId,
          title: dto.title,
          description: dto.description,
          priority: dto.priority ?? MaintenancePriority.MEDIUM,
          status: MaintenanceStatus.OPEN,
          openedByUserId: userId,
        },
        include: {
          asset: true,
          openedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // Immutable audit trail (INV-005)
      await this.auditService.logEvent(
        {
          eventName: "MAINTENANCE_OPENED",
          actorUserId: userId,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          requestId: meta.requestId,
          traceId: meta.traceId,
          resourceType: "Maintenance",
          resourceId: ticket.id,
          changes: {
            ticketNumber,
            assetId: dto.assetId,
            priority: dto.priority ?? MaintenancePriority.MEDIUM,
            previousAssetStatus: asset.status,
            newAssetStatus: AssetStatus.MAINTENANCE,
          },
        },
        tx,
      );

      return ticket;
    });
  }

  /**
   * Lists maintenance work orders with multi-criteria filtering and pagination.
   */
  async listMaintenance(query: QueryMaintenanceDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.assetId) {
      where.assetId = query.assetId;
    }

    if (query.search && query.search.trim() !== "") {
      const search = query.search.trim();
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.MaintenanceOrderByWithRelationInput = {
      createdAt: "desc",
    };
    if (query.sort) {
      const [field, direction] = query.sort.split(":");
      const dir: Prisma.SortOrder =
        direction?.toLowerCase() === "asc" ? "asc" : "desc";

      if (field === "priority") orderBy = { priority: dir };
      else if (field === "status") orderBy = { status: dir };
      else if (field === "openedAt") orderBy = { openedAt: dir };
      else if (field === "cost") orderBy = { cost: dir };
      else orderBy = { createdAt: dir };
    }

    const [tickets, totalItems] = await Promise.all([
      this.prisma.maintenance.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          asset: true,
          openedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          closedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.maintenance.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data: tickets,
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
   * Retrieves single maintenance ticket by ID with full relations.
   */
  async getMaintenanceById(id: string) {
    const ticket = await this.prisma.maintenance.findUnique({
      where: { id },
      include: {
        asset: {
          include: {
            category: true,
            location: true,
            assignedEmployee: true,
          },
        },
        openedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        closedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Maintenance ticket with ID "${id}" not found`,
      );
    }

    return ticket;
  }

  /**
   * Updates an in-progress or open maintenance work order.
   */
  async updateMaintenance(
    id: string,
    dto: UpdateMaintenanceDto,
    userId: string,
    meta: RequestAuditMeta,
  ) {
    const existing = await this.prisma.maintenance.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(
        `Maintenance ticket with ID "${id}" not found`,
      );
    }

    if (
      existing.status === MaintenanceStatus.COMPLETED ||
      existing.status === MaintenanceStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "Cannot update a ticket that is already completed or cancelled",
      );
    }

    const updated = await this.prisma.maintenance.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        ...(dto.resolutionNotes !== undefined && {
          resolutionNotes: dto.resolutionNotes,
        }),
      },
      include: {
        asset: true,
        openedByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
        closedByUser: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Record audit event (INV-005)
    await this.auditService.logEvent({
      eventName: "MAINTENANCE_UPDATED",
      actorUserId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId: meta.requestId,
      traceId: meta.traceId,
      resourceType: "Maintenance",
      resourceId: id,
      changes: {
        ...dto,
      },
    });

    return updated;
  }

  /**
   * Closes a maintenance ticket upon completion of repairs.
   * Restores asset state machine to IN_USE (if assigned) or AVAILABLE (INV-006, INV-007).
   */
  async closeMaintenance(
    id: string,
    dto: CloseMaintenanceDto,
    userId: string,
    meta: RequestAuditMeta,
  ) {
    const ticket = await this.prisma.maintenance.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Maintenance ticket with ID "${id}" not found`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${ticket.assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new NotFoundException("Associated asset not found");
      }

      const asset = assets[0];

      // Domain invariant check (INV-006)
      AssetStateMachine.canCloseMaintenance(asset.status, ticket.status);

      const restoredStatus =
        AssetStateMachine.getRestoredStatusAfterMaintenance(
          !!asset.assigned_employee_id,
        );
      const newVersion = asset.version + 1;

      // Restore asset state machine
      await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: ticket.assetId,
            version: asset.version,
          },
        },
        data: {
          status: restoredStatus,
          version: newVersion,
        },
      });

      const closedTicket = await tx.maintenance.update({
        where: { id },
        data: {
          status: MaintenanceStatus.COMPLETED,
          closedByUserId: userId,
          closedAt: new Date(),
          cost: dto.cost !== undefined ? dto.cost : ticket.cost,
          resolutionNotes: dto.resolutionNotes,
        },
        include: {
          asset: true,
          openedByUser: {
            select: { id: true, name: true, email: true, role: true },
          },
          closedByUser: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // Immutable audit log (INV-005)
      await this.auditService.logEvent(
        {
          eventName: "MAINTENANCE_CLOSED",
          actorUserId: userId,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          requestId: meta.requestId,
          traceId: meta.traceId,
          resourceType: "Maintenance",
          resourceId: id,
          changes: {
            cost: dto.cost,
            resolutionNotes: dto.resolutionNotes,
            previousAssetStatus: asset.status,
            restoredAssetStatus: restoredStatus,
          },
        },
        tx,
      );

      return closedTicket;
    });
  }

  /**
   * Cancels a maintenance work order without performing repairs.
   * Restores asset state machine back to its active operational status (INV-006, INV-007).
   */
  async cancelMaintenance(
    id: string,
    dto: CancelMaintenanceDto,
    userId: string,
    meta: RequestAuditMeta,
  ) {
    const ticket = await this.prisma.maintenance.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Maintenance ticket with ID "${id}" not found`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const assets = await tx.$queryRaw<AssetRawResult[]>`
        SELECT * FROM "assets"
        WHERE id = ${ticket.assetId}
        FOR UPDATE
      `;

      if (!assets || assets.length === 0) {
        throw new NotFoundException("Associated asset not found");
      }

      const asset = assets[0];

      // Domain invariant check (INV-006)
      AssetStateMachine.canCloseMaintenance(asset.status, ticket.status);

      const restoredStatus =
        AssetStateMachine.getRestoredStatusAfterMaintenance(
          !!asset.assigned_employee_id,
        );
      const newVersion = asset.version + 1;

      await tx.asset.update({
        where: {
          idx_assets_id_version: {
            id: ticket.assetId,
            version: asset.version,
          },
        },
        data: {
          status: restoredStatus,
          version: newVersion,
        },
      });

      const cancelledTicket = await tx.maintenance.update({
        where: { id },
        data: {
          status: MaintenanceStatus.CANCELLED,
          closedByUserId: userId,
          closedAt: new Date(),
          resolutionNotes: `Cancelled: ${dto.reason}`,
        },
        include: {
          asset: true,
          openedByUser: {
            select: { id: true, name: true, email: true, role: true },
          },
          closedByUser: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // Immutable audit log (INV-005)
      await this.auditService.logEvent(
        {
          eventName: "MAINTENANCE_CANCELLED",
          actorUserId: userId,
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          requestId: meta.requestId,
          traceId: meta.traceId,
          resourceType: "Maintenance",
          resourceId: id,
          changes: {
            reason: dto.reason,
            restoredAssetStatus: restoredStatus,
          },
        },
        tx,
      );

      return cancelledTicket;
    });
  }
}
