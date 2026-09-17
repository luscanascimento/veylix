import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { validateEnv } from "./config/env.validation.js";
import configuration from "./config/configuration.js";
import { LoggerModule } from "./common/logger/logger.module.js";
import { PrismaModule } from "./modules/prisma/prisma.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { AssetModule } from "./modules/asset/asset.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CategoryModule } from "./modules/category/category.module.js";
import { LocationModule } from "./modules/location/location.module.js";
import { EmployeeModule } from "./modules/employee/employee.module.js";
import { AuditModule } from "./modules/audit/audit.module.js";
import { MaintenanceModule } from "./modules/maintenance/maintenance.module.js";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware.js";
import { AuthGuard } from "./common/guards/auth.guard.js";
import { RolesGuard } from "./common/guards/roles.guard.js";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    LoggerModule,
    PrismaModule,
    HealthModule,
    AssetModule,
    AuthModule,
    CategoryModule,
    LocationModule,
    EmployeeModule,
    AuditModule,
    MaintenanceModule,
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
