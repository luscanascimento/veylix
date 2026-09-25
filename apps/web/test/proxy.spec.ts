import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy.js";

describe("Proxy Edge Middleware", () => {
  it("should allow public path /login without redirecting", () => {
    const req = new NextRequest("http://localhost:3000/login");
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("should allow public path /api/health without redirecting", () => {
    const req = new NextRequest("http://localhost:3000/api/health");
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("should allow static assets (_next/static and favicon.ico)", () => {
    const reqNext = new NextRequest(
      "http://localhost:3000/_next/static/chunk.js",
    );
    const resNext = proxy(reqNext);
    expect(resNext.status).toBe(200);

    const reqFavicon = new NextRequest("http://localhost:3000/favicon.ico");
    const resFavicon = proxy(reqFavicon);
    expect(resFavicon.status).toBe(200);
  });

  it("should redirect unauthenticated users from protected routes to /login", () => {
    const req = new NextRequest("http://localhost:3000/assets");
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("should redirect unauthenticated users from home dashboard to /login", () => {
    const req = new NextRequest("http://localhost:3000/");
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("should allow access to protected routes when valid session cookie exists", () => {
    const req = new NextRequest("http://localhost:3000/assets", {
      headers: {
        cookie: "veylix_session=valid-session-token-xyz",
      },
    });
    const res = proxy(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });
});
