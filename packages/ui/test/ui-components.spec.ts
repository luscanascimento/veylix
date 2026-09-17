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

  it("should render correct badge variant and label for all asset lifecycle statuses", () => {
    const testCases: [AssetStatus, string, string][] = [
      [AssetStatus.AVAILABLE, "success", "Available"],
      [AssetStatus.IN_USE, "default", "In Use"],
      [AssetStatus.MAINTENANCE, "warning", "Maintenance"],
      [AssetStatus.RETIRED, "secondary", "Retired"],
      [AssetStatus.LOST, "destructive", "Lost"],
    ];

    for (const [status, expectedVariant, expectedLabel] of testCases) {
      const element = StatusBadge({ status });
      expect(element.props.variant).toBe(expectedVariant);
      expect(element.props.children).toBe(expectedLabel);
    }
  });

  it("should fallback to outline variant and display string for unknown status", () => {
    const element = StatusBadge({ status: "CUSTOM_STATE" });
    expect(element.props.variant).toBe("outline");
    expect(element.props.children).toBe("CUSTOM_STATE");
  });
});
