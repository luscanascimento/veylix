import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Controller, Get, INestApplication } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import {
  ThrottlerModule,
  ThrottlerGuard,
  Throttle,
  SkipThrottle,
} from "@nestjs/throttler";
import { AuthController } from "../src/modules/auth/auth.controller.js";
import { HealthController } from "../src/modules/health/health.controller.js";

@Controller("test-rate-limit")
class TestRateLimitController {
  @Get("standard")
  standard() {
    return { message: "standard-ok" };
  }

  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Get("sensitive")
  sensitive() {
    return { message: "sensitive-ok" };
  }

  @SkipThrottle()
  @Get("unthrottled")
  unthrottled() {
    return { message: "unthrottled-ok" };
  }
}

describe("Rate Limiting & DoS Protection (Etapa 8)", () => {
  describe("Controller Metadata Configuration", () => {
    it("should configure strict rate limit metadata on AuthController.login (10 req/min)", () => {
      const limit = Reflect.getMetadata(
        "THROTTLER:LIMITdefault",
        AuthController.prototype.login,
      );
      const ttl = Reflect.getMetadata(
        "THROTTLER:TTLdefault",
        AuthController.prototype.login,
      );

      expect(limit).toBe(10);
      expect(ttl).toBe(60000);
    });

    it("should configure SkipThrottle metadata on HealthController to protect probes from throttling", () => {
      const isSkipped = Reflect.getMetadata(
        "THROTTLER:SKIPdefault",
        HealthController,
      );

      expect(isSkipped).toBe(true);
    });
  });

  describe("ThrottlerGuard Enforcement Integration", () => {
    let app: INestApplication;

    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ThrottlerModule.forRoot([
            {
              name: "default",
              ttl: 60000,
              limit: 5,
            },
          ]),
        ],
        controllers: [TestRateLimitController],
        providers: [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterAll(async () => {
      if (app) {
        await app.close();
      }
    });

    it("should allow requests up to the default global limit (5) and reject subsequent requests with 429", async () => {
      const server = app.getHttpServer();

      // 5 requests should succeed
      for (let i = 0; i < 5; i++) {
        const res = await request(server).get("/test-rate-limit/standard");
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("standard-ok");
      }

      // 6th request must be throttled
      const throttledRes = await request(server).get(
        "/test-rate-limit/standard",
      );
      expect(throttledRes.status).toBe(429);
    });

    it("should enforce route-level strict limit override (limit: 2) on sensitive routes", async () => {
      const server = app.getHttpServer();

      // First 2 requests succeed
      const res1 = await request(server).get("/test-rate-limit/sensitive");
      expect(res1.status).toBe(200);

      const res2 = await request(server).get("/test-rate-limit/sensitive");
      expect(res2.status).toBe(200);

      // 3rd request must be blocked with 429
      const res3 = await request(server).get("/test-rate-limit/sensitive");
      expect(res3.status).toBe(429);
    });

    it("should allow unlimited requests on routes decorated with @SkipThrottle", async () => {
      const server = app.getHttpServer();

      // Sending 15 consecutive requests should all succeed
      for (let i = 0; i < 15; i++) {
        const res = await request(server).get("/test-rate-limit/unthrottled");
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("unthrottled-ok");
      }
    });
  });
});
