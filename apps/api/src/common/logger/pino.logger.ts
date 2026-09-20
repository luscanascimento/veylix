import { Injectable, LoggerService } from "@nestjs/common";
import pino from "pino";
import { requestContext } from "../context/request.context.js";

@Injectable()
export class AppLogger implements LoggerService {
  private logger: pino.Logger;

  constructor() {
    const isDev = process.env["NODE_ENV"] !== "production";
    this.logger = pino({
      level: process.env["LOG_LEVEL"] || (isDev ? "debug" : "info"),
      redact: [
        "password",
        "currentPassword",
        "newPassword",
        "authorization",
        "cookie",
        "sessionToken",
      ],
      timestamp: pino.stdTimeFunctions.isoTime,
      base: {
        service: "veylix-api",
        environment: process.env["NODE_ENV"] || "development",
      },
      mixin() {
        const contextData = requestContext.getStore();
        if (contextData) {
          return {
            request_id: contextData.requestId,
            trace_id: contextData.traceId,
            user_id: contextData.userId,
          };
        }
        return {};
      },
    });
  }

  log(message: string, context?: Record<string, unknown> | string) {
    const ctx = typeof context === "string" ? { context } : context || {};
    this.logger.info(ctx, message);
  }

  error(
    message: string,
    trace?: string,
    context?: Record<string, unknown> | string,
  ) {
    const ctx =
      typeof context === "string"
        ? { context, trace }
        : { ...(context || {}), trace };
    this.logger.error(ctx, message);
  }

  warn(message: string, context?: Record<string, unknown> | string) {
    const ctx = typeof context === "string" ? { context } : context || {};
    this.logger.warn(ctx, message);
  }

  debug(message: string, context?: Record<string, unknown> | string) {
    const ctx = typeof context === "string" ? { context } : context || {};
    this.logger.debug(ctx, message);
  }

  verbose(message: string, context?: Record<string, unknown> | string) {
    const ctx = typeof context === "string" ? { context } : context || {};
    this.logger.trace(ctx, message);
  }
}
