import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";

const EXE =
  "/Users/akash/Library/Caches/ms-playwright/chromium-1237/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox", "--disable-gpu"],
});

for (const w of [360, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 820 } });
  await page.goto("http://127.0.0.1:3000/concept1", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const r = await page.evaluate((vw) => {
    const out = { viewport: vw, horizontalScroll: null, offenders: [], nav: [] };
    out.horizontalScroll =
      document.documentElement.scrollWidth > vw
        ? `YES doc=${document.documentElement.scrollWidth}`
        : "no";

    // any element wider than the viewport or spilling past its right edge
    document.querySelectorAll("*").forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width === 0) return;
      if (b.right > vw + 1 || b.left < -1) {
        const tag = `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 34)}`;
        out.offenders.push(
          `${tag} L=${Math.round(b.left)} R=${Math.round(b.right)} W=${Math.round(b.width)}`,
        );
      }
    });
    out.offenders = out.offenders.slice(0, 10);

    // header / nav specifics
    document.querySelectorAll("header, nav").forEach((el) => {
      const b = el.getBoundingClientRect();
      out.nav.push({
        what: `${el.tagName.toLowerCase()} ${(el.getAttribute("aria-label") || "").slice(0, 18)}`,
        rect: `${Math.round(b.left)}..${Math.round(b.right)} w=${Math.round(b.width)}`,
        scrollW: el.scrollWidth,
        clientW: el.clientWidth,
        clipped: el.scrollWidth > el.clientWidth + 1 ? "CLIPPED" : "ok",
      });
    });
    return out;
  }, w);

  console.log(JSON.stringify(r, null, 1));
}
await browser.close();
