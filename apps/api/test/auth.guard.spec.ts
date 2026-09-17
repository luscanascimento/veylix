import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthGuard } from "../src/common/guards/auth.guard.js";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { Reflector } from "@nestjs/core";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@veylix/types";

describe("AuthGuard (Session Authentication Guard)", () => {
  let authGuard: AuthGuard;
  let reflector: Reflector;
  let authService: {
    validateSession: ReturnType<typeof vi.fn>;
  };

  const mockUser = {
    id: "usr_1",
    email: "operator@veylix.io",
    name: "Operator User",
    role: UserRole.OPERATOR,
    isActive: true,
  };

  beforeEach(() => {
    reflector = new Reflector();
    authService = {
      validateSession: vi.fn(),
    };
    authGuard = new AuthGuard(reflector, authService as unknown as AuthService);
  });

  function createMockExecutionContext(
    req: {
      headers?: Record<string, string>;
      cookies?: Record<string, string>;
      user?: unknown;
    },
    isPublic = false,
  ): ExecutionContext {
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(isPublic);

    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => req,
      }),
    } as unknown as ExecutionContext;
  }

  it("should allow request without token if route is marked @Public()", async () => {
    const req = { headers: {} };
    const ctx = createMockExecutionContext(req, true);

    const result = await authGuard.canActivate(ctx);
    expect(result).toBe(true);
    expect(authService.validateSession).not.toHaveBeenCalled();
  });

  it("should throw UnauthorizedException if no token is provided in cookies or headers", async () => {
    const req = { headers: {} };
    const ctx = createMockExecutionContext(req, false);

    await expect(authGuard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException("Authentication token is missing"),
    );
  });

  it("should extract token from veylix_session cookie and authenticate user", async () => {
    const req: { cookies?: Record<string, string>; user?: unknown } = {
      cookies: { veylix_session: "cookie-token-123" },
    };
    const ctx = createMockExecutionContext(req, false);

    authService.validateSession.mockResolvedValue(mockUser);

    const result = await authGuard.canActivate(ctx);
    expect(result).toBe(true);
    expect(authService.validateSession).toHaveBeenCalledWith(
      "cookie-token-123",
    );
    expect(req.user).toEqual(mockUser);
  });

  it("should extract token from Authorization Bearer header when cookie is absent", async () => {
    const req: { headers?: Record<string, string>; user?: unknown } = {
      headers: { authorization: "Bearer bearer-token-456" },
    };
    const ctx = createMockExecutionContext(req, false);

    authService.validateSession.mockResolvedValue(mockUser);

    const result = await authGuard.canActivate(ctx);
    expect(result).toBe(true);
    expect(authService.validateSession).toHaveBeenCalledWith(
      "bearer-token-456",
    );
    expect(req.user).toEqual(mockUser);
  });

  it("should throw UnauthorizedException when session is invalid or expired (validateSession returns null)", async () => {
    const req = {
      cookies: { veylix_session: "expired-or-invalid-token" },
    };
    const ctx = createMockExecutionContext(req, false);

    authService.validateSession.mockResolvedValue(null);

    await expect(authGuard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException("Invalid or expired session"),
    );
  });

  it("should throw UnauthorizedException when validateSession throws an error", async () => {
    const req = {
      cookies: { veylix_session: "corrupt-token" },
    };
    const ctx = createMockExecutionContext(req, false);

    authService.validateSession.mockRejectedValue(new Error("DB error"));

    await expect(authGuard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException("Invalid session"),
    );
  });
});
