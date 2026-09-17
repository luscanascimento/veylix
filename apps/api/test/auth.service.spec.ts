import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../src/modules/auth/auth.service.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import { UserRole } from "@veylix/types";

describe("AuthService (Authentication & Session Strategy - ADR-0003)", () => {
  let authService: AuthService;
  let mockPrisma: {
    user: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    session: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      session: {
        create: vi.fn(),
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    authService = new AuthService(mockPrisma as unknown as PrismaService);
  });

  describe("login", () => {
    it("should successfully authenticate with valid credentials and return sessionToken and user payload", async () => {
      const plainPassword = "SecurePassword123!";
      const passwordHash = await argon2.hash(plainPassword);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "usr_1",
        email: "admin@veylix.io",
        name: "Admin User",
        role: UserRole.ADMIN,
        passwordHash,
        isActive: true,
      });
      mockPrisma.session.create.mockResolvedValue({ id: "sess_1" });
      mockPrisma.user.update.mockResolvedValue({ id: "usr_1" });

      const result = await authService.login(
        { email: "admin@veylix.io", password: plainPassword },
        "127.0.0.1",
        "Mozilla/5.0",
      );

      expect(result).toHaveProperty("sessionToken");
      expect(result.user).toEqual({
        id: "usr_1",
        email: "admin@veylix.io",
        name: "Admin User",
        role: UserRole.ADMIN,
      });
      expect(mockPrisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "usr_1",
            ipAddress: "127.0.0.1",
            userAgent: "Mozilla/5.0",
          }),
        }),
      );
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "usr_1" },
          data: expect.objectContaining({ lastLoginAt: expect.any(Date) }),
        }),
      );
    });

    it("should throw UnauthorizedException when email does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login(
          { email: "nonexistent@veylix.io", password: "Password123!" },
          "127.0.0.1",
          "TestAgent",
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when user isActive is false", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "usr_inactive",
        email: "disabled@veylix.io",
        passwordHash: "some_hash",
        isActive: false,
      });

      await expect(
        authService.login(
          { email: "disabled@veylix.io", password: "Password123!" },
          "127.0.0.1",
          "TestAgent",
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when password does not match", async () => {
      const passwordHash = await argon2.hash("CorrectPassword123!");

      mockPrisma.user.findUnique.mockResolvedValue({
        id: "usr_1",
        email: "admin@veylix.io",
        passwordHash,
        isActive: true,
      });

      await expect(
        authService.login(
          { email: "admin@veylix.io", password: "WrongPassword456!" },
          "127.0.0.1",
          "TestAgent",
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("validateSession", () => {
    it("should return user if session exists and is active", async () => {
      const plainToken = "test-session-token-123";
      const tokenHash = authService.hashSessionToken(plainToken);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      mockPrisma.session.findUnique.mockResolvedValue({
        id: "sess_1",
        sessionTokenHash: tokenHash,
        expiresAt: futureDate,
        user: {
          id: "usr_1",
          email: "admin@veylix.io",
          name: "Admin User",
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      const user = await authService.validateSession(plainToken);
      expect(user).toBeDefined();
      expect(user?.email).toBe("admin@veylix.io");
      expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
        where: { sessionTokenHash: tokenHash },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isActive: true,
            },
          },
        },
      });
    });

    it("should return null if session is not found", async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      const user = await authService.validateSession("invalid-token");
      expect(user).toBeNull();
    });

    it("should return null if session has expired", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockPrisma.session.findUnique.mockResolvedValue({
        id: "sess_expired",
        expiresAt: pastDate,
        user: {
          id: "usr_1",
          email: "admin@veylix.io",
          name: "Admin User",
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      const user = await authService.validateSession("expired-token");
      expect(user).toBeNull();
    });

    it("should return null if user associated with session is deactivated", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);

      mockPrisma.session.findUnique.mockResolvedValue({
        id: "sess_valid",
        expiresAt: futureDate,
        user: {
          id: "usr_1",
          email: "deactivated@veylix.io",
          isActive: false,
        },
      });

      const user = await authService.validateSession("token-inactive-user");
      expect(user).toBeNull();
    });
  });

  describe("logout", () => {
    it("should delete session matching hashed token", async () => {
      const plainToken = "token-to-delete";
      const tokenHash = authService.hashSessionToken(plainToken);

      mockPrisma.session.deleteMany.mockResolvedValue({ count: 1 });

      await authService.logout(plainToken);

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { sessionTokenHash: tokenHash },
      });
    });
  });
});
