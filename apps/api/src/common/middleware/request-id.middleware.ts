import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";

export interface VeylixRequest extends Request {
  requestId?: string;
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

    vReq.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}
