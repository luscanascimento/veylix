import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { AppLogger } from "../logger/pino.logger.js";
import { VeylixRequest } from "../middleware/request-id.middleware.js";
import { ApiErrorResponse } from "@veylix/types";

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<VeylixRequest>();

    const requestId = request.requestId || "req_unknown";

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected server error occurred.";
    let details: Record<string, unknown> | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = this.mapStatusToCode(status);
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;
        message = (resObj["message"] as string) || exception.message;
        if (resObj["code"]) {
          code = resObj["code"] as string;
        }
        if (resObj["details"]) {
          details = resObj["details"] as Record<string, unknown>;
        } else if (Array.isArray(resObj["message"])) {
          details = { validationErrors: resObj["message"] };
          code = "VALIDATION_ERROR";
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        { requestId, path: request.url, method: request.method },
      );
    }

    const errorPayload: ApiErrorResponse = {
      code,
      message,
      requestId,
      ...(details ? { details } : {}),
    };

    response.status(status).json(errorPayload);
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return "UNPROCESSABLE_ENTITY";
      case HttpStatus.TOO_MANY_REQUESTS:
        return "TOO_MANY_REQUESTS";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }
}
