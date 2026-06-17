import { test, expect } from "@playwright/test";
import { b } from "./_base";

const ROUTES: { path: string; mustContain: RegExp }[] = [
  { path: "/", mustContain: /IA na Saúde/i },
  { path: "/pt-PT/", mustContain: /Abertura/i },
  { path: "/pt-PT/demos/", mustContain: /Galeria de demos/i },
  { path: "/pt-PT/bibliografia/", mustContain: /Bibliografia/i },
  { path: "/pt-PT/glossario/", mustContain: /Glossário/i },
  { path: "/pt-PT/sobre/", mustContain: /Sobre/i },
  { path: "/pt-PT/quiz/", mustContain: /Quiz por tópico/i },
];

test.describe("routes · HTML + content", () => {
  for (const r of ROUTES) {
    test(`${r.path} loads + has expected H1`, async ({ page }) => {
      await page.goto(b(r.path));
      await expect(page).toHaveTitle(/IA/);
      await expect(page.locator("h1").first()).toContainText(r.mustContain);
    });
  }
});

test.describe("static assets", () => {
  for (const file of [
    "favicon.ico",
    "favicon.svg",
    "apple-touch-icon.png",
    "icon-192.png",
    "icon-512.png",
    "og.png",
    "cover.png",
    "manifest.webmanifest",
    "sw.js",
    "robots.txt",
    "sitemap.xml",
    "ia-na-saude.epub",
  ]) {
    test(`/${file} served`, async ({ request }) => {
      const r = await request.get(b("/" + file));
      expect(r.status()).toBe(200);
      const body = await r.body();
      expect(body.length).toBeGreaterThan(0);
    });
  }

  test("manifest.webmanifest is valid JSON with required fields", async ({
    request,
  }) => {
    const r = await request.get(b("/manifest.webmanifest"));
    const m = await r.json();
    expect(m.name).toBeTruthy();
    expect(m.start_url).toBeTruthy();
    expect(m.icons.length).toBeGreaterThan(0);
  });
});

test.describe("SEO + head", () => {
  test("pt-PT has canonical + OG image", async ({ page }) => {
    await page.goto(b("/pt-PT/"));
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /og\.png/,
    );
  });

  test("CSP + nosniff present", async ({ page }) => {
    await page.goto(b("/pt-PT/"));
    await expect(
      page.locator('meta[http-equiv="Content-Security-Policy"]'),
    ).toHaveAttribute("content", /default-src 'self'/);
    await expect(
      page.locator('meta[http-equiv="X-Content-Type-Options"]'),
    ).toHaveAttribute("content", "nosniff");
  });

  test("JSON-LD Course schema embedded on lecture page", async ({ page }) => {
    await page.goto(b("/pt-PT/"));
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(ld).toContain('"@type": "Course"');
  });
});
