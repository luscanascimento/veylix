import { describe, it, expect, vi } from "vitest";
import {
  RequestIdMiddleware,
  REQUEST_ID_HEADER,
  TRACE_ID_HEADER,
  VeylixRequest,
} from "../src/common/middleware/request-id.middleware.js";
import { Response } from "express";

describe("RequestIdMiddleware", () => {
  it("should generate a new request ID if none provided", () => {
    const middleware = new RequestIdMiddleware();
    const req = { headers: {} } as unknown as VeylixRequest;
    const res = { setHeader: vi.fn() } as unknown as Response;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(req.requestId?.startsWith("req_")).toBe(true);
    expect(res.setHeader).toHaveBeenCalledWith(
      REQUEST_ID_HEADER,
      req.requestId,
    );
    expect(next).toHaveBeenCalled();
  });

  it("should preserve incoming request ID if valid", () => {
    const middleware = new RequestIdMiddleware();
    const customId = "req_custom_12345";
    const req = {
      headers: { [REQUEST_ID_HEADER]: customId },
    } as unknown as VeylixRequest;
    const res = { setHeader: vi.fn() } as unknown as Response;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBe(customId);
    expect(res.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, customId);
    expect(next).toHaveBeenCalled();
  });

  it("should generate a new request ID if incoming is oversized", () => {
    const middleware = new RequestIdMiddleware();
    const oversizedId = "a".repeat(65);
    const req = {
      headers: { [REQUEST_ID_HEADER]: oversizedId },
    } as unknown as VeylixRequest;
    const res = { setHeader: vi.fn() } as unknown as Response;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(req.requestId).not.toBe(oversizedId);
    expect(req.requestId?.startsWith("req_")).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  it("should generate a new request ID if incoming has invalid characters", () => {
    const middleware = new RequestIdMiddleware();
    const invalidId = "req_123\n\r<script>";
    const req = {
      headers: { [REQUEST_ID_HEADER]: invalidId },
    } as unknown as VeylixRequest;
    const res = { setHeader: vi.fn() } as unknown as Response;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(req.requestId).not.toBe(invalidId);
    expect(req.requestId?.startsWith("req_")).toBe(true);
    expect(next).toHaveBeenCalled();
  });
});
