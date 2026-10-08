import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const base = process.env.SETQ_QA_URL || "http://127.0.0.1:13073/";
const results = [];
try {
  for (const width of [1440, 1024, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForTimeout(1800);
    await page.locator(".gym-scene").scrollIntoViewIfNeeded();
    for (const id of ["lat-pulldown", "treadmill-01", "bench-01"]) {
      await page.locator(".gym-scene__inspector>summary").click();
      await page
        .locator(`.gym-scene button[data-equipment-id="${id}"]`)
        .click();
      await page.waitForTimeout(1800);
      const audit = await new AxeBuilder({ page })
        .include(".gym-scene")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      results.push({
        width,
        id,
        violations: audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(650);
    }
    await context.close();
  }
  await fs.writeFile(
    "output/annotation-accessibility.json",
    JSON.stringify(results, null, 2),
  );
  assert.ok(
    results.every((x) => x.violations.length === 0),
    "Annotation accessibility audit found violations. See output/annotation-accessibility.json",
  );
  console.log(
    JSON.stringify({ status: "PASS", cases: results.length, violations: 0 }),
  );
} finally {
  await browser.close();
}
