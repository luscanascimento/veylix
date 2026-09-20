import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Only mutable requests require CSRF protection
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const csrfHeader = request.headers["x-requested-with"];
      if (csrfHeader !== "XMLHttpRequest") {
        throw new ForbiddenException(
          "CSRF protection: Missing or invalid X-Requested-With header",
        );
      }
    }

    return true;
  }
}
