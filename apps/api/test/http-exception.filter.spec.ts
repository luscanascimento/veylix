import { describe, it, expect, vi } from "vitest";
import { GlobalHttpExceptionFilter } from "../src/common/filters/http-exception.filter.js";
import { AppLogger } from "../src/common/logger/pino.logger.js";
import { VeylixRequest } from "../src/common/middleware/request-id.middleware.js";
import { HttpException, HttpStatus, ArgumentsHost } from "@nestjs/common";
import { Response } from "express";

describe("GlobalHttpExceptionFilter", () => {
  it("should format HttpException into canonical ApiErrorResponse", () => {
    const mockLogger = {
      error: vi.fn(),
      log: vi.fn(),
    } as unknown as AppLogger;

    const filter = new GlobalHttpExceptionFilter(mockLogger);

    const mockResponseJson = vi.fn();
    const mockResponseStatus = vi
      .fn()
      .mockReturnValue({ json: mockResponseJson });
    const mockResponse = { status: mockResponseStatus } as unknown as Response;

    const mockRequest = {
      url: "/api/test",
      method: "GET",
      requestId: "req_test_123",
    } as unknown as VeylixRequest;

    const mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    const exception = new HttpException(
      "Resource not found",
      HttpStatus.NOT_FOUND,
    );
    filter.catch(exception, mockHost);

    expect(mockResponseStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponseJson).toHaveBeenCalledWith({
      code: "NOT_FOUND",
      message: "Resource not found",
      requestId: "req_test_123",
    });
  });
});
