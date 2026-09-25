import { test, expect } from "@playwright/test";
import { execSync } from "child_process";

function hasBrowserDependencies(): boolean {
  try {
    const nss = execSync("ldconfig -p | grep -E 'libnspr4|libnss3'", {
      stdio: "pipe",
    });
    const asound = execSync("ldconfig -p | grep libasound", {
      stdio: "pipe",
    });
    return nss.length > 0 && asound.length > 0;
  } catch {
    return false;
  }
}

const canRunBrowser = hasBrowserDependencies();

test.describe("Web Health Route E2E", () => {
  test("Health API returns ok status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data.app).toBe("veylix-web");
    expect(data.timestamp).toBeDefined();
  });
});

test.describe("Dashboard Browser Journeys", () => {
  test.skip(
    !canRunBrowser,
    "Skipping browser UI test: system lacks libnspr4.so / libnss3. Run 'playwright install-deps' on host or in CI.",
  );

  test("Dashboard page loads and displays core components and metrics", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Page Header and Actions
    await expect(
      page.getByRole("heading", { name: "Asset Inventory Dashboard" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Real-time physical asset lifecycle, custody tracking, and operational metrics.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Register Asset" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Transfer Custody" }),
    ).toBeVisible();

    // 2. KPI Stat Cards
    await expect(page.getByText("Total Assets")).toBeVisible();
    await expect(page.getByText("Active in Custody")).toBeVisible();
    await expect(page.getByText("In Maintenance")).toBeVisible();
    await expect(page.getByText("Total Valuation")).toBeVisible();

    // 3. Chain of Custody Movement Table
    await expect(
      page.getByRole("heading", { name: "Recent Chain of Custody Movements" }),
    ).toBeVisible();
    await expect(page.getByText("MOV-2026-0042")).toBeVisible();
    await expect(page.getByText('MacBook Pro 16" M3 Max')).toBeVisible();
  });

  test("Interactive Search filters movements table correctly", async ({
    page,
  }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder("Filter by patrimony, name...");
    await expect(searchInput).toBeVisible();

    // Initial state: multiple movements visible
    await expect(page.getByText("MOV-2026-0042")).toBeVisible();
    await expect(page.getByText("ThinkPad P1 Gen 6")).toBeVisible();

    // Filter by 'ThinkPad'
    await searchInput.fill("ThinkPad");
    await expect(page.getByText("ThinkPad P1 Gen 6")).toBeVisible();
    await expect(page.getByText('MacBook Pro 16" M3 Max')).not.toBeVisible();

    // Filter by non-existent asset
    await searchInput.fill("UnknownAssetX999");
    await expect(page.getByText("No movements recorded")).toBeVisible();
    await expect(
      page.getByText("Try adjusting your search criteria."),
    ).toBeVisible();

    // Clear filter
    await searchInput.fill("");
    await expect(page.getByText('MacBook Pro 16" M3 Max')).toBeVisible();
  });
});
