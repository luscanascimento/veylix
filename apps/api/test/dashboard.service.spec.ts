import { describe, it, expect, vi } from "vitest";
import { DashboardService } from "../src/modules/dashboard/dashboard.service.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { AssetStatus } from "@veylix/types";

describe("DashboardService", () => {
  it("should aggregate KPIs from the database", async () => {
    const mockPrisma = {
      asset: {
        count: vi.fn().mockImplementation((args?: { where: { status: string } }) => {
          if (!args) return Promise.resolve(100);
          if (args.where.status === AssetStatus.IN_USE) return Promise.resolve(75);
          if (args.where.status === AssetStatus.MAINTENANCE) return Promise.resolve(10);
          return Promise.resolve(0);
        }),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { purchaseValue: "250000.50" },
        }),
      },
    } as unknown as PrismaService;

    const service = new DashboardService(mockPrisma);
    const stats = await service.getStats();

    expect(stats.totalAssets).toBe(100);
    expect(stats.inCustody).toBe(75);
    expect(stats.inMaintenance).toBe(10);
    expect(stats.totalValuation).toBe(250000.5);

    expect(mockPrisma.asset.count).toHaveBeenCalledTimes(3);
    expect(mockPrisma.asset.aggregate).toHaveBeenCalledTimes(1);
  });

  it("should handle null sum from Prisma correctly", async () => {
    const mockPrisma = {
      asset: {
        count: vi.fn().mockResolvedValue(0),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { purchaseValue: null },
        }),
      },
    } as unknown as PrismaService;

    const service = new DashboardService(mockPrisma);
    const stats = await service.getStats();

    expect(stats.totalValuation).toBe(0);
  });
});
