import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../../modules/auth/auth.service.js";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import { Request } from "express";
import { requestContext } from "../context/request.context.js";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Authentication token is missing");
    }

    try {
      const user = await this.authService.validateSession(token);
      if (!user) {
        throw new UnauthorizedException("Invalid or expired session");
      }

      // Map database user to Domain User type if needed, or simply assign
      request.user = user;

      const ctx = requestContext.getStore();
      if (ctx) {
        ctx.userId = user.id;
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid session");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (request.cookies && request.cookies.veylix_session) {
      return request.cookies.veylix_session;
    }
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
