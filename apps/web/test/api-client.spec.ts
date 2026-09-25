import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchApi, ApiError, API_URL } from "../src/lib/api-client.js";

describe("fetchApi Client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should make a GET request with default headers and credentials include", async () => {
    const mockData = { id: "ast_1", name: "Laptop Dell" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockData),
    });

    const result = await fetchApi<typeof mockData>("/assets/ast_1");

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/assets/ast_1`,
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        }),
      }),
    );
    expect(result).toEqual(mockData);
  });

  it("should merge custom headers and options", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true }),
    });

    await fetchApi("/assets", {
      method: "POST",
      headers: { "X-Custom-Header": "test-val" },
      body: JSON.stringify({ name: "New Asset" }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/api/assets`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "New Asset" }),
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-Custom-Header": "test-val",
        }),
      }),
    );
  });

  it("should return empty object on 204 No Content response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await fetchApi("/auth/logout", { method: "POST" });
    expect(result).toEqual({});
  });

  it("should throw ApiError with parsed JSON error message on non-ok status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: vi.fn().mockResolvedValue({
        message: "Invalid credentials",
        code: "AUTH_FAILED",
      }),
    });

    await expect(fetchApi("/auth/login")).rejects.toThrow(ApiError);

    try {
      await fetchApi("/auth/login");
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(401);
      expect(apiErr.message).toBe("Invalid credentials");
      expect(apiErr.data).toEqual({
        message: "Invalid credentials",
        code: "AUTH_FAILED",
      });
    }
  });

  it("should throw ApiError with statusText when error body is not valid JSON", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: vi.fn().mockRejectedValue(new Error("Unexpected token")),
    });

    try {
      await fetchApi("/assets");
      expect.fail("Should have thrown ApiError");
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(502);
      expect(apiErr.message).toBe("Bad Gateway");
    }
  });
});
