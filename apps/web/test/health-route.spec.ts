import { describe, it, expect } from "vitest";
import { GET } from "../src/app/api/health/route.js";

describe("Web Health Route", () => {
  it("should return status ok and application identifier", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.app).toBe("veylix-web");
    expect(typeof data.timestamp).toBe("string");
  });
});
