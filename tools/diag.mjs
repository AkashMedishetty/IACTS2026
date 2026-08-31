import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";

const EXE =
  "/Users/akash/Library/Caches/ms-playwright/chromium-1237/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.split("\n")[0]));
page.on("console", (m) => {
  const t = m.text();
  if (!t.includes("React DevTools")) console.log(`CONSOLE[${m.type()}]:`, t.slice(0, 220));
});
page.on("requestfailed", (r) =>
  console.log("REQFAILED:", r.url().slice(-60), r.failure()?.errorText),
);
page.on("response", (r) => {
  if (r.url().includes("heart-cloud")) console.log("heart-cloud.json ->", r.status());
});

await page.goto("http://127.0.0.1:3000/concept1", { waitUntil: "networkidle" });
await page.waitForTimeout(5000);

const state = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const host = c?.parentElement;
  return {
    canvasAttr: c ? `${c.width}x${c.height}` : "none",
    hostRect: host
      ? `${Math.round(host.getBoundingClientRect().width)}x${Math.round(host.getBoundingClientRect().height)}`
      : "none",
    reactRoot: !!document.querySelector("#__next, [data-reactroot]") || "n/a",
    animClass: document.documentElement.className || document.body.className,
    hydrated: !!window.next || "no window.next",
  };
});
console.log("STATE:", JSON.stringify(state));

await browser.close();
