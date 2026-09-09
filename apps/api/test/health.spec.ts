import { describe, it, expect, vi } from "vitest";
import { HealthService } from "../src/modules/health/health.service.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";

describe("HealthService", () => {
  it("should return liveness status ok", () => {
    const mockPrisma = {} as PrismaService;
    const service = new HealthService(mockPrisma);
    const liveness = service.getLiveness();

    expect(liveness.status).toBe("ok");
    expect(liveness.version).toBe("0.1.0");
    expect(typeof liveness.uptime).toBe("number");
  });

  it("should return readiness status ok when database is healthy", async () => {
    const mockPrisma = {
      isHealthy: vi.fn().mockResolvedValue(true),
    } as unknown as PrismaService;

    const service = new HealthService(mockPrisma);
    const readiness = await service.getReadiness();

    expect(readiness.status).toBe("ok");
    expect(readiness.checks?.database.status).toBe("up");
  });

  it("should return readiness status error when database is down", async () => {
    const mockPrisma = {
      isHealthy: vi.fn().mockResolvedValue(false),
    } as unknown as PrismaService;

    const service = new HealthService(mockPrisma);
    const readiness = await service.getReadiness();

    expect(readiness.status).toBe("error");
    expect(readiness.checks?.database.status).toBe("down");
  });
});
