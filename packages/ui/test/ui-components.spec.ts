import { describe, it, expect } from "vitest";
import { cn, colors, typography, spacing, StatusBadge } from "../src/index.js";
import { AssetStatus } from "@veylix/types";

describe("UI Design System Primitives & Tokens", () => {
  it("should merge class names correctly via cn utility", () => {
    expect(cn("px-2 py-1", "bg-blue-500")).toBe("px-2 py-1 bg-blue-500");
    expect(cn("p-4", "p-2")).toBe("p-2"); // Tailwind merge override
  });

  it("should expose consistent design tokens", () => {
    expect(colors.brand.primary).toBe("#2563eb");
    expect(typography.fontFamily.sans).toBeDefined();
    expect(spacing.radius.full).toBe("9999px");
  });

  it("should export status badge component", () => {
    expect(StatusBadge).toBeDefined();
  });
});
