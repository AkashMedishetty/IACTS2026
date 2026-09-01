import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";

const EXE =
  "/Users/akash/Library/Caches/ms-playwright/chromium-1237/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const OUT = "/Users/akash/CTX/Websites/IACTS 2026/docs/captures/motion";
const concepts = [
  ["thoracic", "thoracic-depth"],
  ["unwound", "myocardium-unwound"],
  ["cycle", "one-cycle"],
];

const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage({
  viewport: { width: 360, height: 780 },
  reducedMotion: "no-preference",
});
await page.goto("http://127.0.0.1:3000/motion-lab", {
  waitUntil: "networkidle",
  timeout: 30000,
});

for (const [name, id] of concepts) {
  const metrics = await page.locator(`#${id}`).evaluate((el) => ({
    top: el.getBoundingClientRect().top + window.scrollY,
    range: el.scrollHeight - window.innerHeight,
  }));
  await page.evaluate((y) => window.scrollTo(0, y), metrics.top + metrics.range * .5);
  await page.waitForTimeout(800);
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    menuVisible: getComputedStyle(document.querySelector('[aria-label="Toggle navigation"]')).display !== "none",
  }));
  await page.screenshot({ path: `${OUT}/${name}-mobile.png` });
  console.log(`${name}: ${JSON.stringify(layout)}`);
}

await browser.close();
