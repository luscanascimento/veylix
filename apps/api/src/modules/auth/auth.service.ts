import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import * as argon2 from "argon2";
import * as crypto from "crypto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a secure random session token.
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Hashes a session token using SHA-256 for secure database storage.
   */
  public hashSessionToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Authenticates a user and creates a database-backed session.
   */
  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate plain token for the client
    const sessionToken = this.generateSessionToken();
    // Hash it for DB
    const sessionTokenHash = this.hashSessionToken(sessionToken);

    // Set expiration to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        sessionTokenHash,
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Validates a session token and returns the associated user.
   */
  async validateSession(sessionToken: string) {
    const sessionTokenHash = this.hashSessionToken(sessionToken);

    const session = await this.prisma.session.findUnique({
      where: { sessionTokenHash },
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

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      return null;
    }

    return session.user;
  }

  /**
   * Invalidates a session by deleting it from the database.
   */
  async logout(sessionToken: string) {
    const sessionTokenHash = this.hashSessionToken(sessionToken);
    await this.prisma.session.deleteMany({
      where: { sessionTokenHash },
    });
  }
}
