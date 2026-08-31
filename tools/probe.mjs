import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";

const EXE =
  "/Users/akash/Library/Caches/ms-playwright/chromium-1237/chrome-mac-arm64/" +
  "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox", "--disable-gpu"],
});

for (const route of ["concept1", "concept2", "concept3"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:3000/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4500);

  const info = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("canvas").forEach((c, i) => {
      const r = c.getBoundingClientRect();
      // is any pixel non-transparent / non-black?
      let painted = null;
      try {
        const g = c.getContext("2d");
        if (g && c.width > 0) {
          const d = g.getImageData(0, 0, c.width, c.height).data;
          let lit = 0;
          for (let p = 0; p < d.length; p += 4 * 97) {
            if (d[p] + d[p + 1] + d[p + 2] > 24) lit++;
          }
          painted = lit;
        }
      } catch (e) {
        painted = `err:${e.name}`;
      }
      out.push({
        i,
        attr: `${c.width}x${c.height}`,
        css: `${Math.round(r.width)}x${Math.round(r.height)}`,
        cls: (c.className || "").slice(0, 30),
        parent: (c.parentElement?.className || "").slice(0, 40),
        litSamples: painted,
      });
    });
    return out;
  });
  console.log(route, JSON.stringify(info, null, 1));
  await page.close();
}
await browser.close();
