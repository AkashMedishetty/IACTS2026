/**
 * Render the generated scientific programme brochure to an A4 PDF.
 *
 *   node scripts/programme-brochure/render.mjs "<output.pdf>"
 *
 * Every page is a fixed A4 box with overflow hidden, so content that outgrows
 * its page is silently clipped. This measures each page's content area first
 * and refuses to write the PDF if anything overflows, naming the page.
 */
import { chromium } from "/opt/homebrew/lib/node_modules/@playwright/cli/node_modules/playwright-core/index.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2];
if (!OUT) throw new Error("Usage: node render.mjs <output.pdf>");
const EXE = process.env.BROCHURE_CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const browser = await chromium.launch({ executablePath: EXE, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
const failed = [];
page.on("requestfailed", (r) => failed.push(r.url()));
await page.goto(pathToFileURL(resolve(HERE, "out/index.html")).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const report = await page.evaluate(() =>
  [...document.querySelectorAll(".page")].map((p, i) => {
    const pad = p.querySelector(".pad");
    const broken = [...p.querySelectorAll("img")].filter((im) => !im.complete || im.naturalWidth === 0).length;
    return { n: i + 1, over: pad ? pad.scrollHeight - pad.clientHeight : 0, broken };
  }),
);
for (const r of report) {
  console.log(`  p${String(r.n).padStart(2, "0")} ${r.over > 1 ? `OVERFLOW +${r.over}px` : "ok"}${r.broken ? `  ${r.broken} broken image(s)` : ""}`);
}
if (failed.length) console.log("failed requests:", failed);
const bad = report.filter((r) => r.over > 1 || r.broken);
if (bad.length) {
  await browser.close();
  throw new Error(`REFUSED — ${bad.length} page(s) overflow or have broken images: ${bad.map((r) => "p" + r.n).join(", ")}`);
}
await page.pdf({ path: OUT, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log(`wrote ${OUT}`);
