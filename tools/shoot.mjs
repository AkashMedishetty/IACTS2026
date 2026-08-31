/**
 * Capture the concept routes AFTER the hero canvas has genuinely drawn.
 *
 * Why this exists: chrome-headless-shell --screenshot and Chrome's
 * --virtual-time-budget both fire before React hydrates and the first
 * requestAnimationFrame runs, so the <canvas> is still 0x0 and the hero art is
 * absent. That produced three PIXEL-IDENTICAL "hero" frames across three
 * visually different concepts — the tell that nothing had drawn. playwright-cli
 * 0.1.18 crashes on launch (CDP assertion), so this drives playwright-core
 * directly.
 *
 * The gate is `canvas.width > 0`: setting canvas.width happens in the same
 * effect that draws, so a sized canvas proves the effect ran rather than
 * merely that time passed.
 */
import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";

const EXE =
  "/Users/akash/Library/Caches/ms-playwright/chromium-1237/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const OUT = "/Users/akash/CTX/Websites/IACTS 2026/docs/captures";
const ROUTES = ["concept1", "concept2", "concept3"];
const SHOTS = [
  { tag: "hero", w: 1440, h: 900, full: false },
  { tag: "full", w: 1440, h: 900, full: true },
  { tag: "768", w: 768, h: 1024, full: true },
  { tag: "360", w: 360, h: 780, full: true },
];

const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

for (const route of ROUTES) {
  for (const s of SHOTS) {
    const page = await browser.newPage({
      viewport: { width: s.w, height: s.h },
      deviceScaleFactor: 1,
    });
    await page.goto(`http://127.0.0.1:3000/${route}`, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Prove the hero effect ran: canvas.width is set in the same effect as draw.
    let sized = null;
    try {
      await page.waitForFunction(
        () => {
          const c = document.querySelector("canvas");
          return !!c && c.width > 0 && c.height > 0;
        },
        { timeout: 12000 },
      );
      sized = await page.evaluate(() => {
        const c = document.querySelector("canvas");
        return { w: c.width, h: c.height };
      });
    } catch {
      sized = "TIMED OUT — canvas never sized";
    }

    // Let the loader finish and a few animation frames accumulate.
    await page.waitForTimeout(3800);

    await page.screenshot({
      path: `${OUT}/${route}-${s.tag}.png`,
      fullPage: s.full,
    });
    console.log(
      `${route}-${s.tag}  canvas=${JSON.stringify(sized)}`,
    );
    await page.close();
  }
}

await browser.close();
console.log("done");
