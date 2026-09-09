import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { validateEnv } from "./config/env.validation.js";
import configuration from "./config/configuration.js";
import { LoggerModule } from "./common/logger/logger.module.js";
import { PrismaModule } from "./modules/prisma/prisma.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware.js";

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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
