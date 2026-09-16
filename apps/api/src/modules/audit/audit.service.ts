import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { Prisma } from "@prisma/client";
import { QueryAuditLogDto } from "./dto/query-audit-log.dto.js";

export interface CreateAuditLogEntry {
  eventName: string;
  actorUserId?: string | null;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  traceId?: string | null;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records an immutable audit log entry (INV-005).
   * Can be executed within an existing Prisma transaction or standalone.
   */
  async logEvent(entry: CreateAuditLogEntry, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    return client.auditLog.create({
      data: {
        eventName: entry.eventName,
        actorUserId: entry.actorUserId ?? null,
        ipAddress: entry.ipAddress || "0.0.0.0",
        userAgent: entry.userAgent || "system",
        requestId: entry.requestId || "req_unknown",
        traceId: entry.traceId ?? null,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        changes: (entry.changes as Prisma.InputJsonValue) || {},
      },
    });
  }

  /**
   * Lists audit logs with pagination, time-range filters, and actor/resource queries.
   */
  async listAuditLogs(query: QueryAuditLogDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (query.resourceType) {
      where.resourceType = query.resourceType;
    }
    if (query.resourceId) {
      where.resourceId = query.resourceId;
    }
    if (query.actorUserId) {
      where.actorUserId = query.actorUserId;
    }
    if (query.eventName) {
      where.eventName = { contains: query.eventName, mode: "insensitive" };
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) {
        where.createdAt.gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        where.createdAt.lte = new Date(query.toDate);
      }
    }

    const [logs, totalItems] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actorUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data: logs,
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
}
