import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const url = process.env.SETQ_QA_URL || "http://127.0.0.1:13073/";
const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const frame = () =>
  page.locator(".hardware-telemetry").evaluate((element) => ({
    time: +element.dataset.timeSeconds,
    lift: +element.dataset.liftMm,
    distance: +element.dataset.distanceMm,
    pointY: +element
      .querySelector(".hardware-telemetry__graph circle")
      .getAttribute("cy"),
    trace: element
      .querySelector(".hardware-telemetry__graph path")
      .getAttribute("d"),
  }));
await fs.mkdir("output/redesign-qa", { recursive: true });
try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  assert.equal(
    await page.locator(".site-shell").getAttribute("data-motion"),
    "running",
  );
  assert.equal(
    await page.locator(".site-shell").getAttribute("data-site-motion-engine"),
    "running",
  );
  await page.locator(".gym-scene__inspector summary").click();
  await page
    .locator('.gym-scene button[data-equipment-id="lat-pulldown"]')
    .focus();
  await page.keyboard.press("Enter");
  const card = page.locator("[data-equipment-card]");
  await card.waitFor();
  const entry = [];
  for (let index = 0; index < 10; index++) {
    entry.push(+(await card.getAttribute("data-entry-progress")));
    await page.waitForTimeout(90);
  }
  assert.ok(
    entry.some((value) => value > 0 && value < 0.99),
    "Annotation entrance has no intermediate frame",
  );
  await page.waitForFunction(
    () =>
      document.querySelector("[data-equipment-card]")?.dataset
        .placementSettled === "true",
  );
  assert.equal(
    await card.locator(".usage-time-graph").getAttribute("data-usage-total"),
    "252",
  );
  await card.locator(".usage-time-graph svg").focus();
  await page.keyboard.press("Home");
  assert.match(
    await card.locator(".usage-time-graph__tooltip").textContent(),
    /06:00/,
  );
  await page.keyboard.press("End");
  assert.match(
    await card.locator(".usage-time-graph__tooltip").textContent(),
    /22:00/,
  );
  await page.getByRole("button", { name: "Keep open", exact: true }).click();
  const annotationA11y = await new AxeBuilder({ page })
    .include("[data-equipment-card]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  await card.screenshot({ path: "output/redesign-qa/annotation.png" });
  await page.keyboard.press("Escape");
  await page.locator("#hardware").scrollIntoViewIfNeeded();
  const hardware = page.locator(".hardware-scene");
  await page
    .locator('.hardware-scene[data-ready="true"]')
    .waitFor({ timeout: 20000 });
  for (const dimension of ["36 mm", "29 mm", "11 mm"])
    assert.ok(await hardware.getByText(dimension, { exact: true }).isVisible());
  await hardware.screenshot({ path: "output/redesign-qa/dimensions.png" });
  await page.getByRole("button", { name: "On a machine", exact: true }).click();
  await page.locator('.hardware-scene[data-playing="true"]').waitFor();
  await page.waitForTimeout(700);
  const frames = [];
  for (let index = 0; index < 12; index++) {
    const value = await frame();
    frames.push(value);
    assert.ok(value.lift >= 0 && value.lift <= 300);
    assert.ok(
      Math.abs(value.lift + value.distance - 550) < 0.003,
      "Sensor distance disagrees with stack travel",
    );
    assert.ok(
      Math.abs(value.pointY - (112 - (value.lift / 300) * 86)) < 0.01,
      "Graph point disagrees with stack travel",
    );
    await page.waitForTimeout(230);
  }
  assert.ok(
    Math.max(...frames.map((value) => value.lift)) -
      Math.min(...frames.map((value) => value.lift)) >
      100,
  );
  assert.ok(
    frames.at(-1).trace.length > frames[0].trace.length,
    "No rolling history is collected",
  );
  await page
    .getByRole("button", { name: "Pause stack movement", exact: true })
    .click();
  const paused = await frame();
  await page.waitForTimeout(400);
  assert.deepEqual(await frame(), paused);
  await hardware.screenshot({ path: "output/redesign-qa/installed.png" });
  await page
    .getByRole("button", { name: "Resume stack movement", exact: true })
    .click();
  await page.waitForTimeout(400);
  assert.ok((await frame()).time > paused.time);
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const offscreen = await frame();
  await page.waitForTimeout(400);
  assert.deepEqual(
    await frame(),
    offscreen,
    "Hardware keeps animating offscreen",
  );
  await page.getByRole("button", { name: "Pause motion", exact: true }).click();
  await hardware.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const globalPause = await frame();
  await page.waitForTimeout(400);
  assert.deepEqual(await frame(), globalPause);
  await page
    .getByRole("button", { name: "Resume motion", exact: true })
    .click();
  await hardware.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  assert.ok((await frame()).time > globalPause.time);
  await page.setViewportSize({ width: 320, height: 1000 });
  await hardware.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const bounds = await hardware.boundingBox();
  assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 321);
  await hardware.screenshot({ path: "output/redesign-qa/installed-320.png" });
  const mobileA11y = await new AxeBuilder({ page })
    .include(".hardware-scene")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  const report = {
    url,
    errors,
    entry,
    frames: frames.map(({ trace, ...value }) => ({
      ...value,
      traceLength: trace.length,
    })),
    annotationAccessibility: annotationA11y.violations,
    mobileHardwareAccessibility: mobileA11y.violations,
  };
  await fs.writeFile(
    "output/redesign-qa/report.json",
    JSON.stringify(report, null, 2),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(annotationA11y.violations, []);
  assert.deepEqual(mobileA11y.violations, []);
  console.log(
    JSON.stringify({
      status: "PASS",
      url,
      annotationEntry: entry,
      synchronizedStack: true,
      localGlobalOffscreenPause: true,
      accessibilityViolations: 0,
    }),
  );
} finally {
  await browser.close();
}
