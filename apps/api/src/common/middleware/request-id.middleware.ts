import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";
export const TRACE_ID_HEADER = "x-trace-id";

export interface VeylixRequest extends Request {
  requestId?: string;
  traceId?: string;
}

const ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/;

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const vReq = req as VeylixRequest;
    
    let incomingId = req.headers[REQUEST_ID_HEADER];
    if (Array.isArray(incomingId)) incomingId = incomingId[0];
    
    const requestId =
      typeof incomingId === "string" && ID_REGEX.test(incomingId.trim())
        ? incomingId.trim()
        : `req_${randomUUID()}`;

    let incomingTrace = req.headers[TRACE_ID_HEADER];
    if (Array.isArray(incomingTrace)) incomingTrace = incomingTrace[0];

    const traceId =
      typeof incomingTrace === "string" && ID_REGEX.test(incomingTrace.trim())
        ? incomingTrace.trim()
        : `trace_${randomUUID()}`;

    vReq.requestId = requestId;
    vReq.traceId = traceId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    res.setHeader(TRACE_ID_HEADER, traceId);
    next();
  }
}
