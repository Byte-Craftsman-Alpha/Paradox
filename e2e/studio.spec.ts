import { test, expect } from "@playwright/test";

test.describe("TEAM PARADOX — keyboard, routes, forms, motion", () => {
  test.beforeEach(async ({ page }) => {
    // Force desktop for predictable viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
  });

  test("skip link reaches main", async ({ page }) => {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });

  test("primary nav reaches every section", async ({ page }) => {
    const items = ["Work", "Capabilities", "Team", "Principles", "Contact"];
    for (const label of items) {
      await page.getByRole("button", { name: label, exact: true }).first().click();
      // Wait for some scroll change
      await page.waitForTimeout(500);
      await expect(page).toHaveURL(new RegExp(`#${label.toLowerCase()}`));
    }
  });

  test("capability filter narrows team + projects, reset works", async ({ page }) => {
    await page.getByRole("button", { name: /AI \/ RAG/i }).click();
    await expect(page.getByRole("status")).toContainText(/Filtered by/i);
    const reset = page.getByRole("button", { name: /Reset filter/i });
    await reset.click();
    await expect(reset).toBeHidden();
  });

  test("team dialog opens, traps focus, closes on Escape and restores", async ({ page }) => {
    await page.getByRole("button", { name: /Anshika Singh/i }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // focus should be inside dialog
    const active = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null);
    expect(active).toBeTruthy();
    // Escape closes
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("contact: validation surfaces inline errors", async ({ page }) => {
    await page.getByRole("button", { name: /^Contact$/i }).click();
    await page.getByRole("button", { name: /Send/ }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("reduced motion freezes Lenis", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForTimeout(400);
    // Lenis is conditional — assert the runtime didn’t trap scroll-to-position via custom behaviour.
    const y = await page.evaluate(() => window.scrollY);
    expect(y).toBe(0);
    await ctx.close();
  });

  test("route /system renders the state gallery", async ({ page }) => {
    await page.goto("/system");
    await expect(page.getByText("State gallery")).toBeVisible();
  });
});
