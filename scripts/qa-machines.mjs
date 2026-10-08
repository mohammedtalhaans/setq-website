import { chromium } from "playwright";
import fs from "node:fs";
const baseURL = process.env.SETQ_QA_URL || "http://127.0.0.1:13073/";
const output = "output/machine-qa";
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = [];
const check = (record, condition, message) => {
  if (!condition) record.issues.push(message);
};
async function readCard(page) {
  return page.locator("[data-equipment-card]").evaluateAll((nodes) =>
    nodes
      .filter(
        (n) =>
          n.getBoundingClientRect().width > 0 &&
          getComputedStyle(n).visibility === "visible",
      )
      .map((n) => ({
        id: n.dataset.equipmentId,
        text: n.innerText,
        box: n
          .querySelector(".machine-annotation__card")
          .getBoundingClientRect()
          .toJSON(),
        anchorX: n.dataset.anchorX,
        anchorY: n.dataset.anchorY,
        headY: n.dataset.headY,
        cardX: n.dataset.cardX,
        cardY: n.dataset.cardY,
        floorX: n.dataset.floorX,
        floorY: n.dataset.floorY,
        stageWidth: n.dataset.stageWidth,
        stageHeight: n.dataset.stageHeight,
        leader: n
          .querySelector(".machine-annotation__leader path")
          ?.getAttribute("d"),
        role: n.querySelector(".machine-annotation__card").getAttribute("role"),
      })),
  );
}
async function clickMachine(page, id) {
  const picker = page.locator(`.gym-scene button[data-equipment-id="${id}"]`);
  await page.waitForFunction(
    (id) => {
      const n = document.querySelector(
        `.gym-scene button[data-equipment-id="${id}"]`,
      );
      return (
        n && n.hasAttribute("data-pick-x") && n.hasAttribute("data-pick-y")
      );
    },
    id,
    { timeout: 8000 },
  );
  const pick = await picker.evaluate((n) => ({
    x: +n.dataset.pickX,
    y: +n.dataset.pickY,
    label: n.getAttribute("aria-label"),
  }));
  const canvas = await page.locator(".gym-scene canvas").boundingBox();
  if (!canvas || !Number.isFinite(pick.x) || !Number.isFinite(pick.y))
    throw new Error(`No actual projected hit coordinate for ${id}`);
  await page.mouse.click(canvas.x + pick.x, canvas.y + pick.y);
  await page.waitForTimeout(1700);
  return pick;
}
for (const width of [1440, 768, 390, 320]) {
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const record = { width, issues: [], machines: [] };
  page.on("pageerror", (e) => record.issues.push(`Page error: ${e.message}`));
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.waitForTimeout(2300);
  const stage = page.locator(".gym-scene");
  await stage.scrollIntoViewIfNeeded();
  const initialLayout = await page.locator(".hero").boundingBox();
  const ids = await stage
    .locator("button[data-equipment-id]")
    .evaluateAll((nodes) => nodes.map((n) => n.dataset.equipmentId));
  if (!ids.length)
    throw new Error(
      "Individual machine picker is not integrated yet; retry after readiness.",
    );
  for (const id of ids) {
    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () => !document.querySelector("[data-equipment-card]"),
    );
    await page.waitForTimeout(700);
    let pick;
    try {
      pick = await clickMachine(page, id);
    } catch (error) {
      record.issues.push(`${id}: ${error.message}`);
      continue;
    }
    const cards = await readCard(page);
    const card = cards[0];
    check(
      record,
      cards.length === 1,
      `${id}: expected one annotation, saw ${cards.length}`,
    );
    check(
      record,
      card?.id === id,
      `${id}: actual canvas click selected ${card?.id ?? "nothing"}`,
    );
    if (card) {
      check(
        record,
        card.box.left >= -1 && card.box.right <= width + 1,
        `${id}: annotation overflows viewport horizontally`,
      );
      check(
        record,
        card.box.top >= -1,
        `${id}: annotation clips above viewport`,
      );
      check(
        record,
        card.text.length > 120,
        `${id}: card lacks detailed evidence`,
      );
      const [cx, cy, ax, ay] = [
        card.cardX,
        card.cardY,
        card.anchorX,
        card.anchorY,
      ].map(Number);
      check(
        record,
        !(
          ax >= cx &&
          ax <= cx + card.box.width &&
          ay >= cy &&
          ay <= cy + card.box.height
        ),
        `${id}: leader pin is hidden inside annotation card`,
      );
      if (card.headY !== undefined)
        check(
          record,
          +card.headY >= cy + card.box.height + 8,
          `${id}: selected equipment head overlaps annotation card`,
        );
      const canvasSize = await stage.locator("canvas").boundingBox();
      check(
        record,
        Math.abs(+card.stageWidth - canvasSize.width) < 2 &&
          Math.abs(+card.stageHeight - canvasSize.height) < 2,
        `${id}: projection dimensions differ from actual canvas`,
      );
      const layout = await page.locator(".hero").boundingBox();
      check(
        record,
        Math.abs(layout.height - initialLayout.height) < 1,
        `${id}: selection changes hero height`,
      );
      record.machines.push({ id, pick, card });
      await stage.screenshot({ path: `${output}/${width}-${id}.png` });
    }
  }
  await page.keyboard.press("Escape");
  check(
    record,
    (await readCard(page)).length === 0,
    "Escape does not close the machine annotation",
  );
  const details = stage.locator("details");
  await details.locator("summary").click();
  const first = stage.locator("button[data-equipment-id]").first();
  await first.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1700);
  check(
    record,
    (await readCard(page)).length === 1,
    "Keyboard picker does not open an annotation",
  );
  await page.keyboard.press("Escape");
  await clickMachine(page, ids[0]);
  const canvas = await stage.locator("canvas").boundingBox();
  await page.mouse.click(canvas.x + 3, canvas.y + 3);
  await page.waitForTimeout(400);
  check(
    record,
    (await readCard(page)).length === 0,
    "Canvas background does not close the annotation",
  );
  const overflow = await page.evaluate(() => ({
    client: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  check(
    record,
    overflow.client === overflow.scroll,
    "Page has horizontal viewport overflow",
  );
  record.overflow = overflow;
  report.push(record);
  console.log(
    JSON.stringify({
      width,
      issues: record.issues,
      selectedMachines: record.machines.length,
    }),
  );
  await context.close();
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    report.map(({ width, issues, machines }) => ({
      width,
      issues,
      selectedMachines: machines.length,
    })),
    null,
    2,
  ),
);
await browser.close();
if (report.some((item) => item.issues.length)) {
  throw new Error(
    "Machine inspection checks failed. See output/machine-qa/report.json.",
  );
}
