import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.SETQ_QA_URL || "http://127.0.0.1:13073/";
const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const errors = [],
  badResponses = [];
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("response", (res) => {
  if (res.status() >= 400 && new URL(res.url()).origin === new URL(base).origin)
    badResponses.push({ url: res.url(), status: res.status() });
});
await fs.mkdir("output", { recursive: true });
try {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1700);
  assert.match(await page.title(), /SetQ/);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(await page.locator('a[href*="setq-hardware"]').count(), 0);
  assert.equal(
    await page
      .locator(".hero-topline, .scene-floating-label, .scene-bottom")
      .count(),
    0,
  );
  assert.doesNotMatch(
    await page.locator("body").innerText(),
    /INTRODUCING SETQ|\b(?:sample|illustrative)\b/i,
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Sample report", exact: true })
      .count(),
    0,
  );
  await page.locator("#platform").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", { name: "Inspect Lat pulldown", exact: true })
    .click();
  assert.equal(
    await page.locator(".detail-title h4").textContent(),
    "Lat pulldown",
  );
  await page
    .getByRole("tab", { name: "Equipment planning", exact: true })
    .click();
  assert.equal(await page.locator(".equipment-row").count(), 6);
  assert.match(
    await page.locator(".equipment-row").first().textContent(),
    /Leg press/,
  );
  await page
    .getByRole("button", { name: "Least activity", exact: true })
    .click();
  assert.match(
    await page.locator(".equipment-row").first().textContent(),
    /Leg extension/,
  );
  await page.getByRole("tab", { name: "Locations", exact: true }).click();
  await page
    .getByRole("button", { name: /Riverside Mixed training club/ })
    .click();
  assert.match(
    await page.locator(".locations-bottom .eyebrow").textContent(),
    /RIVERSIDE/,
  );
  await page.getByRole("tab", { name: "Floor activity", exact: true }).click();
  await page.locator("#intelligence").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page
    .getByRole("button", { name: "Compare my locations.", exact: true })
    .click();
  await page.waitForTimeout(700);
  assert.equal(await page.locator(".evidence-bars>div").count(), 3);
  assert.match(
    await page.locator(".assistant-answer h4").textContent(),
    /Northside/,
  );
  await page
    .getByRole("button", { name: "Prepare a location review", exact: true })
    .click();
  assert.match(
    await page.locator(".followup-feedback").textContent(),
    /Focus this review/,
  );
  await page
    .getByLabel("Try a question about your gym")
    .fill("Should I purchase a machine?");
  await page
    .getByRole("button", { name: "Ask about your gym", exact: true })
    .click();
  await page.waitForTimeout(700);
  assert.match(
    await page.locator(".assistant-answer h4").textContent(),
    /purchase can wait/,
  );
  await page.locator("#hardware").scrollIntoViewIfNeeded();
  await page
    .locator('.hardware-scene[data-ready="true"]')
    .waitFor({ timeout: 20000 });
  await page.getByRole("button", { name: "On a machine", exact: true }).click();
  assert.equal(
    await page.locator(".hardware-scene").getAttribute("data-view"),
    "machine",
  );
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Sensor", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Can we use the platform today?",
      exact: true,
    })
    .click();
  assert.equal(
    await page
      .getByRole("button", {
        name: "Can we use the platform today?",
        exact: true,
      })
      .getAttribute("aria-expanded"),
    "true",
  );
  assert.equal(
    await page.locator('#faq-4 img[src$="brand/claude-symbol.svg"]').count(),
    1,
  );
  const availability = await page.locator("#faq-4").textContent();
  assert.match(availability, /SetQ is in its pilot phase/);
  assert.match(availability, /limited to Australia/);
  assert.match(availability, /request a pilot place/);
  assert.doesNotMatch(availability, /already using/);
  await page
    .getByRole("button", { name: "Book a demo", exact: true })
    .first()
    .click();
  assert.equal(await page.locator("dialog[open]").count(), 1);
  await page.getByLabel("Your name", { exact: true }).fill("QA Example");
  await page
    .getByLabel("Work email", { exact: true })
    .fill("example@example.com");
  await page.getByLabel("Gym name", { exact: true }).fill("QA Club");
  const formA11y = await new AxeBuilder({ page })
    .include(".contact-dialog[open]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog[open]").count(), 0);
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  assert.equal(await page.locator(".privacy-dialog[open]").count(), 1);
  await page.keyboard.press("Escape");
  for (const section of await page.locator("main>section").all()) {
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
  }
  await page.waitForTimeout(700);
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const summarize = (results) =>
    results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    }));
  await fs.writeFile(
    "output/accessibility.json",
    JSON.stringify(
      { page: summarize(accessibility), form: summarize(formA11y) },
      null,
      2,
    ),
  );
  const sizes = [];
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(300);
    const actual = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert.ok(
      actual.scroll <= width + 1,
      `horizontal overflow at${width}: ${actual.scroll}`,
    );
    sizes.push(actual);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Close navigation", exact: true })
      .getAttribute("aria-expanded"),
    "true",
  );
  await page
    .locator("header nav")
    .getByRole("link", { name: "Hardware", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .getAttribute("aria-expanded"),
    "false",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
  assert.equal(
    await page.locator(".site-shell").getAttribute("data-motion"),
    "running",
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Reduced motion", exact: true })
      .count(),
    0,
  );
  await page.locator("#hardware").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "On a machine", exact: true }).click();
  await page.waitForTimeout(1200);
  assert.equal(
    await page.locator(".hardware-scene").getAttribute("data-playing"),
    "true",
  );
  const mobileAccessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await fs.writeFile(
    "output/mobile-accessibility.json",
    JSON.stringify(summarize(mobileAccessibility), null, 2),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(badResponses, []);
  assert.deepEqual(accessibility.violations, []);
  assert.deepEqual(formA11y.violations, []);
  assert.deepEqual(mobileAccessibility.violations, []);
  await fs.writeFile(
    "output/verification.json",
    JSON.stringify(
      {
        status: "PASS",
        url: base,
        errors,
        badResponses,
        sizes,
        accessibilityViolations: accessibility.violations.length,
        formViolations: formA11y.violations.length,
        mobileAccessibilityViolations: mobileAccessibility.violations.length,
        checks: [
          "clean hero and removed floor controls",
          "equipment selection",
          "planning rankings",
          "locations",
          "sample download removed",
          "assistant questions",
          "local followup",
          "hardware views",
          "FAQ",
          "contact dialog fields/Escape",
          "privacy",
          "mobile navigation",
          "responsive overflow",
          "explicit motion control under OS reduced preference",
        ],
      },
      null,
      2,
    ),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(badResponses, []);
  assert.deepEqual(accessibility.violations, []);
  assert.deepEqual(formA11y.violations, []);
  console.log(
    JSON.stringify({
      status: "PASS",
      errors,
      badResponses,
      accessibilityViolations: accessibility.violations.length,
      formViolations: formA11y.violations.length,
      sizes,
    }),
  );
} finally {
  await browser.close();
}
