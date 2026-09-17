import { describe, it, expect, vi } from "vitest";
import { DashboardController } from "../src/modules/dashboard/dashboard.controller.js";
import { DashboardService } from "../src/modules/dashboard/dashboard.service.js";

describe("DashboardController", () => {
  it("should return dashboard stats", async () => {
    const mockStats = {
      totalAssets: 100,
      inCustody: 75,
      inMaintenance: 10,
      totalValuation: 250000,
    };

    const mockService = {
      getStats: vi.fn().mockResolvedValue(mockStats),
    } as unknown as DashboardService;

    const controller = new DashboardController(mockService);
    const result = await controller.getStats();

    expect(result).toEqual(mockStats);
    expect(mockService.getStats).toHaveBeenCalledTimes(1);
  });
});
