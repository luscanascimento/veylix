import { describe, it, expect } from "vitest";
import { AuthController } from "../src/modules/auth/auth.controller.js";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { Request } from "express";

describe("AuthController", () => {
  it("getMe should return the user from the request", () => {
    const mockAuthService = {} as unknown as AuthService;
    const controller = new AuthController(mockAuthService);

    const req = {
      user: { id: "user_123", email: "test@example.com" },
    } as unknown as Request;
    const result = controller.getMe(req);

    expect(result.user).toEqual({ id: "user_123", email: "test@example.com" });
  });
});
