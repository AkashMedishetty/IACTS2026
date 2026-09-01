import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";
import { mkdir, copyFile } from "node:fs/promises";

const EXE =
  "/Users/akash/Library/Caches/ms-playwright/chromium-1237/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const OUT = "/Users/akash/CTX/Websites/IACTS 2026/docs/captures/motion";
const RAW = "/tmp/iacts-motion-raw";
const URL = process.env.MOTION_URL ?? "http://127.0.0.1:3000/motion-lab";
const allConcepts = [
  ["thoracic", "thoracic-depth"],
  ["unwound", "myocardium-unwound"],
  ["cycle", "one-cycle"],
];
const concepts = process.env.MOTION_ONLY
  ? allConcepts.filter(([name]) => name === process.env.MOTION_ONLY)
  : allConcepts;

await mkdir(OUT, { recursive: true });
await mkdir(RAW, { recursive: true });
const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

for (const [name, id] of concepts) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: RAW, size: { width: 1280, height: 720 } },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`page: ${e.message}`));
  page.on("requestfailed", (r) => {
    if (!r.url().includes("_next/hmr")) errors.push(`request: ${r.url()} ${r.failure()?.errorText}`);
  });

  await page.goto(`${URL}#${id}`, { waitUntil: "networkidle", timeout: 30000 });
  const section = page.locator(`#${id}`);
  await section.waitFor({ state: "visible" });
  const metrics = await section.evaluate((el) => ({
    top: el.getBoundingClientRect().top + window.scrollY,
    range: Math.max(1, el.scrollHeight - window.innerHeight),
  }));

  await page.evaluate((y) => window.scrollTo(0, y), metrics.top);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}-start.png` });

  const STEPS = 54;
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const y = metrics.top + metrics.range * t;
    await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
    await page.mouse.move(
      640 + Math.sin(t * Math.PI * 2) * 270,
      350 + Math.cos(t * Math.PI * 2) * 110,
    );
    if (i === Math.floor(STEPS / 2)) {
      await page.screenshot({ path: `${OUT}/${name}-mid.png` });
    }
    await page.waitForTimeout(72);
  }
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${name}-end.png` });

  const video = page.video();
  await page.close();
  await context.close();
  const rawPath = await video.path();
  const outPath = `${OUT}/${name}.webm`;
  await copyFile(rawPath, outPath);
  console.log(`${name}: ${outPath} errors=${errors.length}`);
  errors.forEach((e) => console.log(`  ${e}`));
}

await browser.close();
