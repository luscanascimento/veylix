import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Request, Response } from "express";
import { Public } from "../../common/decorators/public.decorator";
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ipAddress = req.ip || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const result = await this.authService.login(dto, ipAddress, userAgent);

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

    res.cookie("veylix_session", result.sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { user: result.user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token =
      req.cookies?.veylix_session ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : null);

    if (token) {
      await this.authService.logout(token);
    }

    res.clearCookie("veylix_session");
    return { success: true };
  }

  @Get("me")
  @HttpCode(HttpStatus.OK)
  getMe(@Req() req: Request) {
    // The AuthGuard already validates the session and attaches the user to the request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { user: (req as any).user };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      req.cookies?.veylix_session ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : null);

    if (!token) {
      throw new UnauthorizedException("No session token provided");
    }

    const ipAddress = req.ip || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const result = await this.authService.refreshSession(
      token,
      ipAddress,
      userAgent,
    );

    const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";

    res.cookie("veylix_session", result.sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user: result.user };
  }

  @Post("revoke-all")
  @HttpCode(HttpStatus.OK)
  async revokeAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException();
    }

    await this.authService.revokeAllSessions(user.id);
    res.clearCookie("veylix_session");

    return { success: true };
  }
}
