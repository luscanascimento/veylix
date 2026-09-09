import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { HealthCheckResponse } from "@veylix/types";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getLiveness(): HealthCheckResponse {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env["NODE_ENV"] || "development",
      version: "0.1.0",
    };
  }

  async getReadiness(): Promise<HealthCheckResponse> {
    const start = performance.now();
    const isDbHealthy = await this.prisma.isHealthy();
    const duration = Math.round(performance.now() - start);

    const isReady = isDbHealthy;

    return {
      status: isReady ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env["NODE_ENV"] || "development",
      version: "0.1.0",
      checks: {
        database: {
          status: isDbHealthy ? "up" : "down",
          latencyMs: duration,
        },
      },
    };
  }
}
