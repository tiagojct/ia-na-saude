import { test, expect } from "@playwright/test";
import { b } from "./_base";

test.describe("smoke · lecture page + custom elements hydrate", () => {
  test("lecture page has all 14 sections", async ({ page }) => {
    await page.goto(b("/pt-PT/"));
    const sections = await page.locator("section[data-section]").count();
    expect(sections).toBe(14);
  });

  test("tokenizer-demo hydrates after scroll", async ({ page }) => {
    await page.goto(b("/pt-PT/"));
    const demo = page.locator("tokenizer-demo");
    await demo.scrollIntoViewIfNeeded();
    // Lit upgrades the element · gives it a shadow-less light DOM child.
    await expect(demo.locator("textarea").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("preset clicks rewrite URL state (tk.pt=...)", async ({ page }) => {
    await page.goto(b("/pt-PT/#tokens"));
    const demo = page.locator("tokenizer-demo");
    await demo.scrollIntoViewIfNeeded();
    await demo.locator("textarea").first().waitFor();
    await demo.locator('button:has-text("nota da Maria")').click();
    await expect.poll(() => page.url()).toContain("tk.pt=");
  });

  test("Cmd-K palette opens via keyboard shortcut", async ({ page }) => {
    await page.goto(b("/pt-PT/"));
    await page.keyboard.press("Meta+k");
    await expect(page.locator("#cmdk-palette")).not.toHaveClass(/hidden/);
  });

  test("theme toggle persists in localStorage", async ({ page }) => {
    await page.goto(b("/pt-PT/"));
    await page.locator("details summary").first().click();
    await page.locator('button[data-theme="dark"]').click();
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });
});
