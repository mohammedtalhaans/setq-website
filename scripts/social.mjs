import { chromium } from "playwright";
const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto("http://127.0.0.1:13073/", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
.site-header{height:82px;border:0;padding:0 45px}.site-header nav,.header-actions,.hero-topline,.hero-footnote,.hero-small,.scene-toplabel,.scene-bottom,.scene-floating-label,.hero-buttons{display:none!important}
.hero{padding:0 45px;max-width:none}.hero-grid{min-height:548px;grid-template-columns:45% 55%;align-items:center}.hero-copy{padding:0;transform:translateY(-7px)}.hero-category{margin-bottom:25px;font-size:11px;letter-spacing:.7px;max-width:none}.hero h1{font-size:76px;letter-spacing:-3px;margin-bottom:27px}.hero h1 em{letter-spacing:-2px}.hero-copy>p{font-size:16px;max-width:350px;line-height:1.8}.hero-copy>.claude-credit{margin-top:30px;font-size:11px}.hero-copy>.claude-credit img{width:75px}.hero-scene-frame{height:525px;width:calc(100% + 35px);margin:0 -35px 0 -10px}.site-shell main>section:not(.hero),.site-footer{display:none}.hero-scene-frame canvas{pointer-events:none}
`,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1900);
  await page.screenshot({ path: "public/social-preview.png" });
  console.log("Created public/social-preview.png from the actual SetQ scene");
} finally {
  await browser.close();
}
