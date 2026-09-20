import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { loggerAsyncLocalStorage } from "../logger/logger-context.js";

export const REQUEST_ID_HEADER = "x-request-id";
export const TRACE_ID_HEADER = "x-trace-id";

export interface VeylixRequest extends Request {
  requestId?: string;
  traceId?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const vReq = req as VeylixRequest;
    const incomingId = req.headers[REQUEST_ID_HEADER];
    const requestId =
      typeof incomingId === "string" && incomingId.trim().length > 0
        ? incomingId
        : `req_${randomUUID()}`;

    const incomingTrace = req.headers[TRACE_ID_HEADER];
    const traceId =
      typeof incomingTrace === "string" && incomingTrace.trim().length > 0
        ? incomingTrace
        : `trace_${randomUUID()}`;

    vReq.requestId = requestId;
    vReq.traceId = traceId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    res.setHeader(TRACE_ID_HEADER, traceId);

    loggerAsyncLocalStorage.run(
      {
        requestId,
        traceId,
        // userId would typically be populated by an auth guard or middleware later in the lifecycle
      },
      () => {
        next();
      }
    );
  }
}
