import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";

const EXE =
  "/Users/akash/Library/Caches/ms-playwright/chromium-1237/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const OUT = "/Users/akash/CTX/Websites/IACTS 2026/docs/captures";
const concepts = ["field", "band", "signal"];
const sizes = [
  { tag: "desktop", width: 1440, height: 900 },
  { tag: "mobile", width: 360, height: 780 },
];

const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox", "--disable-gpu", "--hide-scrollbars"],
});

for (const size of sizes) {
  const page = await browser.newPage({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
  });
  await page.goto("http://127.0.0.1:3000/hero-lab", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForFunction(
    () => [...document.querySelectorAll("canvas")].every((c) => c.width > 300),
    { timeout: 12000 },
  );
  await page.waitForTimeout(3200);

  for (const concept of concepts) {
    const section = page.locator(`#lab-${concept}`);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await section.boundingBox();
    await section.screenshot({
      path: `${OUT}/lab-${concept}-${size.tag}.png`,
    });
    console.log(
      `${concept}-${size.tag}: ${Math.round(box?.width || 0)}x${Math.round(box?.height || 0)}`,
    );
  }
  await page.close();
}

await browser.close();
