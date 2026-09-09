import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { AppLogger } from "./common/logger/pino.logger.js";
import { GlobalHttpExceptionFilter } from "./common/filters/http-exception.filter.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const corsOrigins = (
    process.env["CORS_ORIGINS"] || "http://localhost:3000"
  ).split(",");
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-Id",
      "Idempotency-Key",
    ],
  });

  // Global Prefix
  app.setGlobalPrefix("api", {
    exclude: ["health/liveness", "health/readiness"],
  });

  // Global Exception Filter
  app.useGlobalFilters(new GlobalHttpExceptionFilter(logger));

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Graceful Shutdown
  app.enableShutdownHooks();

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("Veylix API")
    .setDescription(
      "Enterprise Asset Inventory & Lifecycle Management Platform API",
    )
    .setVersion("0.1.0")
    .addTag("Health", "System diagnostics and health probes")
    .addCookieAuth("veylix_session")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = parseInt(process.env["PORT"] || "4000", 10);
  await app.listen(port);
  logger.log(`Veylix API server started on port ${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});
