import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { performance } from "node:perf_hooks";

const baseURL = process.env.SETQ_QA_URL || "http://127.0.0.1:13073/";
const output = "output/motion-qa";
const results = [];
const caseFilter = process.env.SETQ_QA_CASE?.toLowerCase() || "";
const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
await fs.mkdir(output, { recursive: true });

async function createPage({
  width = 1440,
  reducedMotion = "no-preference",
} = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__qaGymDrawCalls = 0;
    window.__qaLastControlClickAt = null;
    window.__qaFirstCountdown = null;
    document.addEventListener(
      "click",
      (event) => {
        const control = event.target.closest?.("button, summary");
        if (!control) return;
        window.__qaLastControlClickAt = performance.now();
        if (control.matches(".gym-scene button[data-equipment-id]"))
          window.__qaFirstCountdown = null;
      },
      true,
    );
    new MutationObserver(() => {
      const clock = document.querySelector(
        "[data-equipment-card] [data-countdown-seconds]",
      );
      const value = clock?.getAttribute("data-countdown-seconds");
      if (window.__qaFirstCountdown === null && value && value !== "--")
        window.__qaFirstCountdown = Number(value);
    }).observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-countdown-seconds"],
    });
    const proto = window.WebGL2RenderingContext?.prototype;
    if (!proto) return;
    [
      "drawElements",
      "drawArrays",
      "drawElementsInstanced",
      "drawArraysInstanced",
    ].forEach((name) => {
      const original = proto[name];
      if (!original) return;
      proto[name] = function (...args) {
        if (this.canvas?.closest?.(".gym-scene")) window.__qaGymDrawCalls += 1;
        return original.apply(this, args);
      };
    });
  });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.locator(".gym-scene__inspector > summary").waitFor();
  await page.waitForTimeout(1700);
  await scrollTo(page.locator(".gym-scene"));
  return { page, context, errors };
}

const card = (page) => page.locator("[data-equipment-card]");
const scrollTo = async (locator) =>
  locator.evaluate((element) =>
    element.scrollIntoView({ block: "nearest", behavior: "instant" }),
  );
async function moveTo(page, locator) {
  const bounds = await locator.boundingBox();
  assert.ok(bounds, "The intended control has no visible bounds");
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
}
async function clickControl(page, locator) {
  // Decorative floats stop on pointer entry. Approach as a person does before
  // asking Playwright to confirm stable, visible, unobstructed click geometry.
  await moveTo(page, locator);
  await locator.click();
  const sinceClick = await page.evaluate(
    () => performance.now() - window.__qaLastControlClickAt,
  );
  assert.ok(
    Number.isFinite(sinceClick),
    "The native control click was not observed",
  );
  return performance.now() - sinceClick;
}
const seconds = async (page) => {
  const value = await page
    .locator("[data-countdown-seconds]")
    .first()
    .getAttribute("data-countdown-seconds");
  return value === "" || value === "--" || value === null
    ? null
    : Number(value);
};
async function selectAsset(page, id = "lat-pulldown") {
  const previousDeadline = await card(page).evaluateAll((layers) =>
    Number(layers[0]?.dataset.closeDeadline || 0),
  );
  await clickControl(page, page.locator(".gym-scene__inspector > summary"));
  await clickControl(
    page,
    page.locator(`.gym-scene button[data-equipment-id="${id}"]`),
  );
  await page
    .locator(`[data-equipment-card][data-equipment-id="${id}"]`)
    .waitFor({ state: "visible" });
  await releaseInteraction(page);
  return timerOrigin(page, previousDeadline);
}
async function timerOrigin(page, previousDeadline = 0) {
  await page.waitForFunction((previous) => {
    const value = Number(
      document.querySelector("[data-equipment-card]")?.dataset.closeDeadline ||
        0,
    );
    return Number.isFinite(value) && value > previous;
  }, previousDeadline);
  const clock = await card(page).evaluate((layer) => ({
    deadline: Number(layer.dataset.closeDeadline),
    now: performance.now(),
    click: window.__qaLastControlClickAt,
  }));
  // The product begins ten seconds after its first valid visible projection.
  // Read that native deadline without mutating or replacing any browser clock.
  return performance.now() - (clock.now - (clock.deadline - 10000));
}
async function releaseInteraction(page) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement?.blur?.());
}
async function waitUntil(page, startedAt, elapsed) {
  const remaining = elapsed - (performance.now() - startedAt);
  if (remaining > 0) await page.waitForTimeout(remaining);
}
async function waitClosed(page, startedAt) {
  await card(page).waitFor({ state: "detached", timeout: 2500 });
  const elapsed = performance.now() - startedAt;
  assert.ok(
    elapsed >= 9800 && elapsed < 11500,
    `Auto-close took ${elapsed.toFixed(0)}ms; expected about ten seconds plus the exit transition`,
  );
  return Math.round(elapsed);
}
async function readFrame(page) {
  return card(page).evaluate((layer) => {
    const face = layer
      .querySelector(".machine-annotation__surface")
      .getBoundingClientRect();
    const path =
      layer
        .querySelector(".machine-annotation__leader path")
        .getAttribute("d") || "";
    const numbers = (
      path.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) || []
    ).map(Number);
    return {
      offset: Number(layer.dataset.bobOffset),
      top: face.top,
      left: face.left,
      right: face.right,
      bottom: face.bottom,
      startX: numbers[0],
      startY: numbers[1],
      endX: numbers.at(-2),
      endY: numbers.at(-1),
      anchorX: Number(layer.dataset.anchorX),
      anchorY: Number(layer.dataset.anchorY),
    };
  });
}
async function sampleFrames(page, count = 12, interval = 100) {
  const samples = [];
  for (let i = 0; i < count; i += 1) {
    samples.push(await readFrame(page));
    if (i < count - 1) await page.waitForTimeout(interval);
  }
  return samples;
}
async function sampleSiteLoop(page, count = 8, interval = 120) {
  const samples = [];
  for (let i = 0; i < count; i += 1) {
    samples.push(
      await page.locator(".hero-topline i").evaluate((dot) => ({
        opacity: Number(getComputedStyle(dot).opacity),
        transform: getComputedStyle(dot).transform,
        state: dot
          .closest(".hero-topline")
          .getAttribute("data-site-motion-state"),
      })),
    );
    if (i < count - 1) await page.waitForTimeout(interval);
  }
  return samples;
}
const siteLoopMoves = (samples) =>
  range(samples, "opacity") > 0.005 ||
  new Set(samples.map((sample) => sample.transform)).size > 1;
const range = (samples, key) =>
  Math.max(...samples.map((sample) => sample[key])) -
  Math.min(...samples.map((sample) => sample[key]));
function assertStill(samples, { rest = false } = {}) {
  assert.ok(range(samples, "offset") < 0.2, "The idle bob did not stop");
  assert.ok(
    range(samples, "top") < 0.3,
    "The annotation still moves while motion should be paused",
  );
  if (rest)
    assert.ok(
      samples.every((sample) => Math.abs(sample.offset) < 0.15),
      "Paused/reduced motion should put the annotation at rest",
    );
}

async function runCase(name, action) {
  if (caseFilter && !name.toLowerCase().includes(caseFilter)) return;
  const started = performance.now();
  console.log(`START ${name}`);
  try {
    const detail = await action();
    results.push({
      name,
      status: "PASS",
      durationMs: Math.round(performance.now() - started),
      ...detail,
    });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({
      name,
      status: "FAIL",
      durationMs: Math.round(performance.now() - started),
      error: error.stack || error.message,
    });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

try {
  // Independent contexts keep the real ten-second cases short without changing
  // the product clock, injecting a shortened deadline, or submitting enquiries.
  await Promise.all([
    runCase("default deadline and countdown", async () => {
      const session = await createPage();
      const { page, context, errors } = session;
      try {
        const started = await selectAsset(page);
        assert.equal(await card(page).getAttribute("data-pinned"), "false");
        const freshSeconds = await seconds(page);
        assert.equal(
          await page.evaluate(() => window.__qaFirstCountdown),
          10,
          "A fresh annotation did not begin with a ten-second countdown",
        );
        assert.equal(
          await page.locator(".machine-annotation__countdown-ring").count(),
          1,
        );
        await waitUntil(page, started, 3100);
        const midway = await seconds(page);
        assert.ok(
          midway >= 6 && midway <= 7,
          `Countdown at 3.1 seconds was ${midway}`,
        );
        await waitUntil(page, started, 9000);
        assert.equal(
          await card(page).count(),
          1,
          "Annotation closed before nine seconds",
        );
        assert.ok((await seconds(page)) >= 1 && (await seconds(page)) <= 2);
        const closedAtMs = await waitClosed(page, started);
        assert.deepEqual(errors, []);
        return { closedAtMs, freshSeconds, midwaySeconds: midway };
      } finally {
        await context.close();
      }
    }),
    runCase("new equipment starts a fresh deadline", async () => {
      const { page, context, errors } = await createPage();
      try {
        const first = await selectAsset(page);
        await waitUntil(page, first, 7000);
        const replacement = await selectAsset(page, "chest-press");
        assert.ok(
          (await seconds(page)) >= 9,
          "Selecting another asset did not reset the countdown",
        );
        await waitUntil(page, replacement, 3500);
        assert.equal(
          await card(page).getAttribute("data-equipment-id"),
          "chest-press",
          "The original asset deadline closed its replacement",
        );
        await waitUntil(page, replacement, 9000);
        assert.equal(await card(page).count(), 1);
        const closedAtMs = await waitClosed(page, replacement);
        assert.deepEqual(errors, []);
        return { replacementClosedAtMs: closedAtMs };
      } finally {
        await context.close();
      }
    }),
    runCase("keep open and unpin restart", async () => {
      const { page, context, errors } = await createPage();
      try {
        await selectAsset(page);
        const keepOpen = page.getByRole("button", {
          name: "Keep open",
          exact: true,
        });
        assert.equal(await keepOpen.getAttribute("aria-pressed"), "false");
        await clickControl(page, keepOpen);
        await releaseInteraction(page);
        assert.equal(await card(page).getAttribute("data-pinned"), "true");
        assert.equal(
          await page
            .getByRole("button", { name: "Allow auto-close", exact: true })
            .getAttribute("aria-pressed"),
          "true",
        );
        assert.equal(
          await seconds(page),
          null,
          "Pinned cards should not display a misleading expiry countdown",
        );
        await page.waitForTimeout(11000);
        assert.equal(
          await card(page).count(),
          1,
          "Keep open did not prevent expiry",
        );
        const oldDeadline = await card(page).getAttribute(
          "data-close-deadline",
        );
        await clickControl(
          page,
          page.getByRole("button", { name: "Allow auto-close", exact: true }),
        );
        const restarted = await timerOrigin(page, Number(oldDeadline));
        await releaseInteraction(page);
        assert.ok((await seconds(page)) >= 9);
        await waitUntil(page, restarted, 9000);
        assert.equal(
          await card(page).count(),
          1,
          "Unpin resumed an old deadline instead of starting ten fresh seconds",
        );
        const closedAtMs = await waitClosed(page, restarted);
        assert.deepEqual(errors, []);
        return { unpinnedClosedAtMs: closedAtMs };
      } finally {
        await context.close();
      }
    }),
  ]);

  await Promise.all([
    runCase(
      "DOM float, leader tracking, hover, visibility and motion control",
      async () => {
        const { page, context, errors } = await createPage();
        try {
          await selectAsset(page);
          await clickControl(
            page,
            page.getByRole("button", { name: "Keep open", exact: true }),
          );
          await releaseInteraction(page);
          await page.waitForTimeout(2100);
          const callsBefore = await page.evaluate(
            () => window.__qaGymDrawCalls,
          );
          const moving = await sampleFrames(page, 16, 120);
          const callsAfter = await page.evaluate(() => window.__qaGymDrawCalls);
          assert.ok(
            range(moving, "offset") > 0.35,
            "The idle annotation has no measurable float",
          );
          assert.ok(
            range(moving, "top") > 0.35,
            "The float offset does not move the rendered card",
          );
          assert.ok(
            range(moving, "startY") > 0.35,
            "The leader does not follow the floating card",
          );
          assert.ok(
            range(moving, "endX") < 0.2 && range(moving, "endY") < 0.2,
            "The leader endpoint drifts away from the machine",
          );
          assert.ok(
            moving.every(
              (sample) =>
                Math.abs(sample.endX - sample.anchorX) < 0.2 &&
                Math.abs(sample.endY - sample.anchorY) < 0.2,
            ),
            "The leader endpoint does not match the machine anchor",
          );
          assert.equal(
            callsAfter - callsBefore,
            0,
            "The DOM float keeps the WebGL gym rendering while idle",
          );
          const reference = moving[0];
          assert.ok(
            moving.every(
              (sample) =>
                Math.abs(
                  sample.startY -
                    reference.startY -
                    (sample.top - reference.top),
                ) < 1.5,
            ),
            "Leader displacement and card displacement diverge",
          );
          await scrollTo(page.locator(".hero-topline"));
          const siteLoop = await sampleSiteLoop(page, 12, 120);
          assert.ok(
            siteLoopMoves(siteLoop),
            "The visible introduction signal has no deliberate site motion",
          );

          await moveTo(page, page.locator(".machine-annotation__surface"));
          await page.waitForTimeout(450);
          assertStill(await sampleFrames(page, 8, 100));
          await releaseInteraction(page);
          await page.keyboard.press("Tab");
          await page
            .getByRole("button", { name: "Allow auto-close", exact: true })
            .focus();
          await page.waitForTimeout(350);
          assertStill(await sampleFrames(page, 8, 100));
          await releaseInteraction(page);

          // Synthetic visibility events exercise the same browser-state handler;
          // no browser lifecycle freeze is used to hide active timers from the test.
          await page.evaluate(() => {
            Object.defineProperty(document, "hidden", {
              configurable: true,
              get: () => true,
            });
            Object.defineProperty(document, "visibilityState", {
              configurable: true,
              get: () => "hidden",
            });
            document.dispatchEvent(new Event("visibilitychange"));
          });
          await page.waitForTimeout(350);
          assertStill(await sampleFrames(page, 8, 100));
          assert.equal(
            siteLoopMoves(await sampleSiteLoop(page)),
            false,
            "Site loops continue while the document is hidden",
          );
          await page.evaluate(() => {
            delete document.hidden;
            delete document.visibilityState;
            document.dispatchEvent(new Event("visibilitychange"));
          });
          await page.waitForTimeout(250);
          assert.ok(
            range(await sampleFrames(page, 12, 100), "offset") > 0.3,
            "Float did not resume when the page became visible",
          );

          await page
            .getByRole("button", { name: "Pause motion", exact: true })
            .click();
          assert.equal(
            await page.locator(".site-shell").getAttribute("data-motion"),
            "paused",
          );
          await scrollTo(page.locator(".gym-scene"));
          await scrollTo(page.locator(".hero-topline"));
          await page.waitForTimeout(400);
          assertStill(await sampleFrames(page, 8, 100), { rest: true });
          assert.equal(
            siteLoopMoves(await sampleSiteLoop(page)),
            false,
            "Pause motion does not stop the site signal loop",
          );
          assert.equal(
            await page
              .getByRole("button", { name: "Resume motion", exact: true })
              .count(),
            1,
          );
          await page.screenshot({ path: `${output}/paused-desktop.png` });
          await page.reload({ waitUntil: "networkidle" });
          assert.equal(
            await page.locator(".site-shell").getAttribute("data-motion"),
            "paused",
            "The motion preference did not persist across reload",
          );
          assert.equal(
            await page
              .getByRole("button", { name: "Resume motion", exact: true })
              .count(),
            1,
          );
          await page.waitForTimeout(1700);
          await scrollTo(page.locator(".gym-scene"));
          const restarted = await selectAsset(page);
          await waitUntil(page, restarted, 9000);
          assert.equal(await card(page).count(), 1);
          const closedAtMs = await waitClosed(page, restarted);
          await page
            .getByRole("button", { name: "Resume motion", exact: true })
            .click();
          assert.equal(
            await page.locator(".site-shell").getAttribute("data-motion"),
            "running",
          );
          await scrollTo(page.locator(".hero-topline"));
          await page.waitForTimeout(150);
          assert.ok(
            siteLoopMoves(await sampleSiteLoop(page, 12, 120)),
            "Site motion did not resume",
          );
          await scrollTo(page.locator("#platform"));
          await page.waitForTimeout(1400);
          const opacity = await page
            .locator("#platform .section-heading")
            .evaluate((el) => Number(getComputedStyle(el).opacity));
          assert.ok(
            opacity >= 0.98,
            "Existing section reveal left platform content hidden",
          );
          assert.deepEqual(errors, []);
          return {
            floatRangePx: +range(moving, "offset").toFixed(2),
            idleWebGLDrawCalls: callsAfter - callsBefore,
            pausedAutoCloseMs: closedAtMs,
            platformRevealOpacity: opacity,
          };
        } finally {
          await context.close();
        }
      },
    ),
    runCase("reduced motion and 320px annotation", async () => {
      const { page, context, errors } = await createPage({
        width: 320,
        reducedMotion: "reduce",
      });
      try {
        const started = await selectAsset(page);
        assert.equal(
          await page
            .getByRole("button", { name: "Reduced motion", exact: true })
            .isDisabled(),
          true,
        );
        assert.equal(
          await page.locator(".site-shell").getAttribute("data-motion"),
          "paused",
        );
        await page.waitForTimeout(350);
        const stationary = await sampleFrames(page, 8, 100);
        assertStill(stationary, { rest: true });
        assert.equal(
          siteLoopMoves(await sampleSiteLoop(page)),
          false,
          "Reduced motion still runs the site signal loop",
        );
        assert.ok(
          stationary.every(
            (sample) => sample.left >= -1 && sample.right <= 321,
          ),
          "The floating card overflows a 320px viewport",
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth,
          ),
          false,
          "Mobile page has horizontal overflow",
        );
        await page
          .locator(".gym-scene")
          .screenshot({ path: `${output}/reduced-mobile-320.png` });
        await waitUntil(page, started, 9000);
        assert.equal(
          await card(page).count(),
          1,
          "Reduced motion unexpectedly changed the deadline",
        );
        const closedAtMs = await waitClosed(page, started);
        assert.deepEqual(errors, []);
        return {
          reducedMotionAutoCloseMs: closedAtMs,
          horizontalOverflow: false,
        };
      } finally {
        await context.close();
      }
    }),
  ]);
} finally {
  await fs.writeFile(
    `${output}/results.json`,
    JSON.stringify({ baseURL, results }, null, 2),
  );
  await browser.close();
}

const failures = results.filter((result) => result.status === "FAIL");
console.log(
  JSON.stringify({
    status: failures.length ? "FAIL" : "PASS",
    cases: results.length,
    failures: failures.length,
    report: `${output}/results.json`,
  }),
);
if (failures.length) process.exitCode = 1;
