/**
 * Render the delegate brochure route to PDF.
 *
 * A brochure page is a fixed A4 box with overflow:hidden, so content that
 * outgrows its box is silently CLIPPED — invisible in the PDF and impossible to
 * catch by glancing at a thumbnail. So this measures every page's scrollHeight
 * against its clientHeight FIRST and refuses to write the PDF if any page
 * overflows, naming the page and the overflow in px.
 *
 * Usage:  node scripts/render-brochure.mjs [outputPath] [baseUrl]
 */
import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const OUT = process.argv[2] ?? "public/brochure/IACTS-TechnoCollege-CME-2026-Delegate-Brochure.pdf";
const BASE = process.argv[3] ?? "http://127.0.0.1:5173";
const EXE = process.env.BROCHURE_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });

const consoleErrors = [];
const failedRequests = [];
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
page.on("requestfailed", (r) => failedRequests.push(`${r.url()} ${r.failure()?.errorText ?? ""}`));
page.on("response", (r) => {
  if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
});

const url = `${BASE}/brochure`;
const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
if (!res || res.status() !== 200) {
  await browser.close();
  throw new Error(`${url} returned ${res ? res.status() : "no response"}`);
}
await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
// Fonts must be settled or every measurement is taken against a fallback face.
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  const pages = [...document.querySelectorAll(".bro-page")];
  return {
    count: pages.length,
    pages: pages.map((el, i) => {
      const foot = el.querySelector(".bro-foot-num");
      const imgs = [...el.querySelectorAll("img")];
      /* Measuring the PAGE alone is not enough: .bro-body is a flex child with
         min-height:0, so it SHRINKS to fit rather than pushing the page taller.
         Content can therefore clip inside the body while the page reports no
         overflow at all. Measure both, and take the worse. */
      const body = el.querySelector(".bro-body");
      const pageOver = Math.max(0, el.scrollHeight - el.clientHeight);
      const bodyOver = body ? Math.max(0, body.scrollHeight - body.clientHeight) : 0;
      return {
        i: i + 1,
        num: foot ? foot.textContent.trim() : "(cover)",
        overflow: Math.max(pageOver, bodyOver),
        pageOver,
        bodyOver,
        h: el.clientHeight,
        brokenImgs: imgs.filter((im) => !im.complete || im.naturalWidth === 0).map((im) => im.getAttribute("src")),
        links: [...el.querySelectorAll("a[href]")].length,
        emptyText: (el.textContent || "").trim().length < 40,
      };
    }),
  };
});

console.log(`pages: ${report.count}`);
for (const p of report.pages) {
  const flags = [
    p.overflow > 1 ? `OVERFLOW +${p.overflow}px` : null,
    p.brokenImgs.length ? `BROKEN IMG ${p.brokenImgs.join(",")}` : null,
    p.emptyText ? "NEARLY EMPTY" : null,
  ].filter(Boolean);
  console.log(
    `  p${String(p.i).padStart(2, "0")} [${p.num}] h=${p.h} pg+${p.pageOver} body+${p.bodyOver} links=${p.links} ${flags.length ? ":: " + flags.join(" | ") : "ok"}`,
  );
}

const bad = report.pages.filter((p) => p.overflow > 1 || p.brokenImgs.length);
if (failedRequests.length) console.log("failed requests:", failedRequests.slice(0, 8));
if (consoleErrors.length) console.log("console errors:", consoleErrors.slice(0, 5));

if (bad.length) {
  await browser.close();
  throw new Error(
    `REFUSED to write the PDF — ${bad.length} page(s) clip content: ` +
      bad.map((p) => `p${p.i}(${p.num})`).join(", "),
  );
}

await mkdir(dirname(OUT), { recursive: true });
await page.pdf({
  path: OUT,
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});
console.log(`wrote ${OUT}`);
await browser.close();
