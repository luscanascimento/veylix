import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { AppLogger } from "../../common/logger/pino.logger.js";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly appLogger: AppLogger) {
    super();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      if (this.appLogger) this.appLogger.log("Prisma database connection established successfully.");
    } catch (error) {
      if (this.appLogger) {
        this.appLogger.error(
          "Failed to connect to database during initialization",
          error instanceof Error ? error.stack : undefined,
        );
      } else {
        console.error("Failed to connect to database during initialization", error);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    if (this.appLogger) this.appLogger.log("Prisma database connection disconnected cleanly.");
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Fail-fast timeout to prevent hanging the Docker probe
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Database ping timeout")), 2000),
      );
      await Promise.race([this.$queryRaw`SELECT 1`, timeout]);
      return true;
    } catch (error) {
      this.appLogger.warn(
        "Health check database ping failed or timed out",
        error instanceof Error ? error.message : undefined,
      );
      return false;
    }
  }
}
