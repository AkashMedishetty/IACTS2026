import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";
import { copyFile, mkdir } from "node:fs/promises";

const executablePath =
  "/Users/akash/Library/Caches/ms-playwright/chromium-1237/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const url = process.env.ANATOMY_URL ?? "http://127.0.0.1:3000/anatomy-lab";
const out = "/Users/akash/CTX/Websites/IACTS 2026/docs/captures/anatomy";
const raw = "/tmp/iacts-anatomy-recording";
await mkdir(out, { recursive: true });
await mkdir(raw, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--hide-scrollbars"],
});

const errors = [];
const desktop = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  reducedMotion: "no-preference",
  recordVideo: { dir: raw, size: { width: 1280, height: 720 } },
});
const page = await desktop.newPage();
page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
page.on("requestfailed", (request) => errors.push(`request: ${request.url()} ${request.failure()?.errorText}`));
await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
await page.locator("canvas").waitFor({ state: "visible" });
await page.waitForTimeout(1_200);

const metrics = await page.evaluate(() => ({
  range: document.documentElement.scrollHeight - window.innerHeight,
  viewport: document.documentElement.clientWidth,
  document: document.documentElement.scrollWidth,
  canvas: (() => {
    const canvas = document.querySelector("canvas");
    return canvas ? { width: canvas.width, height: canvas.height } : null;
  })(),
}));
await page.screenshot({ path: `${out}/anatomy-00-form.png` });

const captures = new Map([
  [22, "anatomy-01-angular.png"],
  [48, "anatomy-02-free.png"],
  [72, "anatomy-03-interaction.png"],
]);
const steps = 92;
for (let index = 0; index <= steps; index++) {
  const progress = index / steps;
  await page.evaluate((y) => window.scrollTo(0, y), metrics.range * progress);
  await page.mouse.move(
    640 + Math.sin(progress * Math.PI * 3) * 250,
    350 + Math.cos(progress * Math.PI * 2) * 105,
  );
  if (index === 58) {
    await page.mouse.down();
    await page.mouse.move(760, 300, { steps: 8 });
    await page.mouse.up();
  }
  if (index === 68) await page.getByRole("button", { name: "Apply impulse" }).click();
  if (captures.has(index)) await page.screenshot({ path: `${out}/${captures.get(index)}` });
  await page.waitForTimeout(82);
}
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/anatomy-04-reformed.png` });

const video = page.video();
await page.close();
await desktop.close();
await copyFile(await video.path(), `${out}/anatomy.webm`);

const performanceContext = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  reducedMotion: "no-preference",
});
const performancePage = await performanceContext.newPage();
await performancePage.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
await performancePage.locator("canvas").waitFor({ state: "visible" });
await performancePage.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * .5));
await performancePage.waitForTimeout(900);
const performanceMetrics = await performancePage.evaluate(async () => {
  const canvas = document.querySelector("canvas");
  const gl = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
  const rendererInfo = gl?.getExtension("WEBGL_debug_renderer_info");
  const renderer = gl && rendererInfo ? gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL) : "unavailable";
  let frames = 0;
  const started = performance.now();
  await new Promise((resolve) => {
    const tick = () => {
      frames++;
      if (performance.now() - started < 2_000) requestAnimationFrame(tick);
      else resolve(undefined);
    };
    requestAnimationFrame(tick);
  });
  const elapsed = performance.now() - started;
  return { fps: frames / elapsed * 1_000, frames, elapsed, renderer };
});
await performanceContext.close();

const mobile = await browser.newContext({
  viewport: { width: 360, height: 780 },
  reducedMotion: "no-preference",
});
const mobilePage = await mobile.newPage();
mobilePage.on("pageerror", (error) => errors.push(`mobile page: ${error.message}`));
await mobilePage.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
await mobilePage.locator("canvas").waitFor({ state: "visible" });
await mobilePage.waitForTimeout(1_000);
const mobileMetrics = await mobilePage.evaluate(() => ({
  range: document.documentElement.scrollHeight - window.innerHeight,
  viewport: document.documentElement.clientWidth,
  document: document.documentElement.scrollWidth,
}));
for (const [progress, name] of [[0, "mobile-form"], [.5, "mobile-free"], [1, "mobile-reformed"]]) {
  await mobilePage.evaluate((y) => window.scrollTo(0, y), mobileMetrics.range * progress);
  await mobilePage.waitForTimeout(650);
  await mobilePage.screenshot({ path: `${out}/${name}.png` });
}
await mobile.close();
await browser.close();

console.log(JSON.stringify({ url, desktop: metrics, performance: performanceMetrics, mobile: mobileMetrics, errors }, null, 2));
