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
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware.js";
import { AuthGuard } from "./common/guards/auth.guard.js";
import { RolesGuard } from "./common/guards/roles.guard.js";

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
  ],
  providers: [
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
