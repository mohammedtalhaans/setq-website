import { chromium } from "playwright";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
await page.goto("http://127.0.0.1:13073/", { waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2000);
await page.screenshot({ path: "output/desktop-hero.png" });
for (const name of ["approach", "platform", "intelligence", "hardware"]) {
  await page.locator("#" + name).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `output/desktop-${name}.png` });
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1600);
await page.screenshot({ path: "output/desktop-bottom.png" });
await page.screenshot({ path: "output/desktop-full.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: "networkidle" });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2000);
await page.screenshot({ path: "output/mobile-hero.png" });
for (const name of ["platform", "intelligence", "hardware"]) {
  await page.locator("#" + name).scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `output/mobile-${name}.png` });
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
await page.screenshot({ path: "output/mobile-full.png", fullPage: true });
await fs.writeFile(
  "output/capture-errors.json",
  JSON.stringify(errors, null, 2),
);
console.log(JSON.stringify({ errors }));
await browser.close();
