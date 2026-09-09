import { describe, it, expect } from "vitest";
import { validateEnv } from "../src/config/env.validation.js";

describe("Environment Validation", () => {
  it("should succeed with valid configuration", () => {
    const validConfig = {
      NODE_ENV: "development",
      PORT: "4000",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      SESSION_SECRET: "min_32_characters_long_secret_key_12345",
      CORS_ORIGINS: "http://localhost:3000",
      LOG_LEVEL: "info",
    };

    const validated = validateEnv(validConfig);
    expect(validated.PORT).toBe(4000);
    expect(validated.NODE_ENV).toBe("development");
  });

  it("should throw when SESSION_SECRET is too short (< 32 chars)", () => {
    const invalidConfig = {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      SESSION_SECRET: "too_short",
    };

    expect(() => validateEnv(invalidConfig)).toThrow(/SESSION_SECRET/);
  });
});
