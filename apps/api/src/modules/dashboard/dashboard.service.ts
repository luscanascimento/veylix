import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { AssetStatus } from "@veylix/types";

export interface DashboardStats {
  totalAssets: number;
  inCustody: number;
  inMaintenance: number;
  totalValuation: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStats> {
    const [totalAssets, inCustody, inMaintenance, valuationResult] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.count({
        where: { status: AssetStatus.IN_USE },
      }),
      this.prisma.asset.count({
        where: { status: AssetStatus.MAINTENANCE },
      }),
      this.prisma.asset.aggregate({
        _sum: {
          purchasePrice: true,
        },
      }),
    ]);

    // Prisma returns Decimal for sum, we convert it to number or default to 0
    const totalValuation = valuationResult._sum.purchasePrice 
      ? Number(valuationResult._sum.purchasePrice)
      : 0;

    return {
      totalAssets,
      inCustody,
      inMaintenance,
      totalValuation,
    };
  }
}
