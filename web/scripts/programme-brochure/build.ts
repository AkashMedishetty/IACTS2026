/**
 * SCIENTIFIC PROGRAMME BROCHURE — generated from the site's data.
 *
 *   npx tsx scripts/programme-brochure/build.ts        -> scripts/programme-brochure/out/index.html
 *   node scripts/programme-brochure/render.mjs <pdf>   -> A4 PDF (refuses if any page overflows)
 *
 * Every session, time, speaker and chairperson comes from src/data/schedule.ts —
 * the file the website's /programme renders — so the brochure cannot disagree
 * with the site. Re-run both scripts after any schedule change.
 *
 * Design: the event's own palette (crimson, wine, gold on ivory), Anton for
 * display, Barlow for reading, Barlow Condensed for times and labels. Built to
 * be read at a glance: each session opens with a band naming its chairpersons,
 * times sit in one column, and the talk title leads with the speaker beneath.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { conference, venues, secretariat, registrationHelpline } from '../../src/data/conference'
import {
  scheduleDays,
  workshopHalls,
  workshopLunch,
  breakthroughTopics,
  type ScheduleItem,
} from '../../src/data/schedule'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, 'out/index.html')
const PUB = '../../../public'
const LOGO = `${PUB}/brand/iacts-technocollege-2026-logo.png`

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const weekday = (d: string) =>
  new Date(`${d} 12:00 UTC`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/* Fonts: only the @font-face rules from the trade brochure's stylesheet. */
const fontFaces = (readFileSync(resolve(HERE, '../trade-brochure/assets/base.css'), 'utf8').match(/@font-face\s*\{[^}]*\}/g) || []).join('\n')

let pageNo = 0
function page(inner: string, cls = ''): string {
  pageNo += 1
  return `<section class="page ${cls}">
  <header class="ph"><img src="${LOGO}" alt=""><span>Scientific Programme · 23 – 25 October 2026</span></header>
  <div class="pad">${inner}</div>
  <footer class="pf"><span>IACTS TechnoCollege CME 2026 · iactstechnocollegecme2026.com</span><span class="pg">${String(pageNo).padStart(2, '0')}</span></footer>
</section>`
}

/* ---- timing helpers: a session's span is its first start to its last end ---- */
function minutes(t: string, fallbackAp?: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?/i)
  if (!m) return null
  let h = +m[1]
  const ap = (m[3] || fallbackAp || '').toLowerCase()
  if (ap === 'pm' && h !== 12) h += 12
  if (ap === 'am' && h === 12) h = 0
  return h * 60 + +m[2]
}
function span(range?: string): [number, number] | null {
  if (!range) return null
  const [a, b] = range.split('–').map((x) => x.trim())
  const ap = (b || a).match(/(am|pm)/i)?.[1]
  const s = minutes(a, a.match(/(am|pm)/i)?.[1] || ap)
  const e = b ? minutes(b) : s
  return s === null || e === null ? null : [s, e]
}
const clock = (m: number) => {
  const h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am', h12 = ((h + 11) % 12) + 1
  return `${h12}:${String(mm).padStart(2, '0')} ${ap}`
}

/** Collapse a day into blocks for the at-a-glance page. */
function glance(items: readonly ScheduleItem[]) {
  const out: { label: string; time: string; kind: string }[] = []
  let cur: { label: string; s: number; e: number } | null = null
  const flush = () => {
    if (cur) out.push({ label: cur.label, time: `${clock(cur.s)} – ${clock(cur.e)}`, kind: 'session' })
    cur = null
  }
  for (const it of items) {
    if (it.kind === 'session') { flush(); cur = { label: it.title, s: Infinity, e: -Infinity }; continue }
    const sp = span(it.time)
    if (it.kind === 'talk' || (it.kind === 'special' && it.n && !/quiz/i.test(it.title))) {
      if (cur && sp) { cur.s = Math.min(cur.s, sp[0]); cur.e = Math.max(cur.e, sp[1]) }
      continue
    }
    if (it.kind === 'special' && it.n) continue
    flush()
    const label = it.kind === 'panel' ? 'Panel Discussion' : it.title
    out.push({ label, time: it.time || '', kind: it.kind })
  }
  flush()
  return out
}

/* ---------------------------------------------------------------- cover
 * The cover reuses the committee's approved cover artwork (the illustrated
 * heart, the Hyderabad skyline), shared with the delegate and trade brochures,
 * so the three read as one family. Two areas are replaced: the top-left
 * association block carries the event logo instead, and the bottom title line
 * reads "Scientific Programme". Positions are measured on the 1414 x 2000 art
 * (1 px = 0.1485 mm).
 */
const ART = '../../trade-brochure/assets/cover.jpg'
const cover = `<section class="page cover">
  <img class="cv-art" src="${ART}" alt="">
  <div class="cv-mask" style="left:8.6mm;top:16.4mm;width:106mm;height:29mm"></div>
  <img class="cv-logo" src="${LOGO}" alt="IACTS TechnoCollege CME 2026">
  <div class="cv-mask" style="left:7.2mm;top:276.3mm;width:134mm;height:15.2mm"></div>
  <div class="cv-title" id="cvTitle"><span class="r">Scientific</span>&nbsp;<span>Programme</span></div>
</section>
<script>
  /* Fit the title to the width the original line occupied. */
  (function () {
    var el = document.getElementById('cvTitle'), size = 40;
    el.style.fontSize = size + 'pt';
    while (el.scrollWidth > el.clientWidth && size > 14) { size -= 0.5; el.style.fontSize = size + 'pt'; }
  })();
</script>`

const [d1, d2] = scheduleDays

/* -------------------------------------------------------- at a glance */
const glanceCol = (tag: string, date: string, venue: string, rows: { label: string; time: string; kind: string }[]) => `
  <div class="g-col">
    <div class="g-tag">${tag}</div>
    <div class="g-date">${esc(date)}</div>
    <div class="g-venue">${esc(venue)}</div>
    <ul>${rows.map((r) => `<li class="g-${r.kind}"><span class="g-t">${esc(r.time)}</span><span class="g-l">${esc(r.label)}</span></li>`).join('')}</ul>
  </div>`

const day0Rows = [
  ...workshopHalls.flatMap((h) => [{ label: `${h.hall} · ${h.items.length} stations`, time: `${h.items[0].time.split('–')[0].trim()} am – ${h.items[h.items.length - 1].time.split('–')[1].trim()}`, kind: 'session' }]),
  { label: 'Lunch', time: workshopLunch, kind: 'break' },
]
const glancePage = page(`
  <div class="kicker">Three days</div>
  <h2 class="h2">Programme <span>at a glance</span></h2>
  <div class="g-grid">
    ${glanceCol('Day 0', weekday('23 October 2026'), `Pre-Conference Workshop · ${venues[0].name}`, day0Rows)}
    ${glanceCol('Day 1', weekday(d1.date), d1.venue, glance(d1.items))}
    ${glanceCol('Day 2', weekday(d2.date), d2.venue, glance(d2.items))}
  </div>
  <div class="note"><b>Breakthrough Sessions</b> run in Hall B alongside the main programme — see the last page.</div>
`)

/* ------------------------------------------------------------ day 0 */
const workshopPage = page(`
  <div class="dayhead"><span class="daytag gold">Day 0</span><div><div class="dh-date">${esc(weekday('23 October 2026'))}</div><div class="dh-venue">Pre-Conference Workshop · ${esc(venues[0].full)}</div></div></div>
  <h2 class="h2">Hands-on <span>workshops</span></h2>
  <p class="lede">Two halls run in parallel. Places are limited and confirmed with registration.</p>
  <div class="halls">
    ${workshopHalls.map((h) => `
      <div class="hall">
        <div class="hall-h">${h.hall}</div>
        ${h.items.map((i) => `<div class="hr"><div class="hr-t">${esc(i.time)}</div><div><div class="hr-title">${esc(i.title)}</div><div class="hr-fac">${esc(i.faculty.join(' · '))}</div></div></div>`).join('')}
      </div>`).join('')}
  </div>
  <div class="breakline"><span>Lunch</span>${esc(workshopLunch)} · both halls</div>
`)

/* ------------------------------------------------------------ timetable */
function rowHtml(it: ScheduleItem): string {
  if (it.kind === 'session') {
    return `<div class="sess"><div class="sess-band"><span class="sess-name">${esc(it.title)}</span></div>
      ${it.chairpersons?.length ? `<div class="sess-chairs"><b>Chairpersons</b> ${esc(it.chairpersons.join(' · '))}</div>` : ''}</div>`
  }
  if (it.kind === 'break') {
    return `<div class="brk"><span class="brk-t">${esc(it.time || '')}</span><span class="brk-l">${esc(it.title)}</span></div>`
  }
  if (it.kind === 'ceremony' && it.guests?.length) {
    return `<div class="feature cer"><div class="f-top"><span class="f-t">${esc(it.time || '')}</span><span class="f-badge">Ceremony</span></div>
      <div class="f-title">${esc(it.title)}</div>
      <div class="f-label">On the dais</div><div class="guests">${it.guests.map((g) => `<span>${esc(g)}</span>`).join('')}</div></div>`
  }
  if (it.kind === 'panel') {
    const [, ...rest] = it.title.split('—')
    return `<div class="feature"><div class="f-top"><span class="f-t">${esc(it.time || '')}</span><span class="f-badge">Panel Discussion</span></div>
      <div class="f-title">${esc((rest.join('—') || it.title).trim())}</div>
      ${it.moderator ? `<div class="f-people"><b>Moderator</b> ${esc(it.moderator)}</div>` : ''}
      ${it.panelists?.length ? `<div class="f-people"><b>Panelists</b> ${esc(it.panelists.join(' · '))}</div>` : ''}</div>`
  }
  const key = /keynote/i.test(it.title)
  const cer = it.kind === 'ceremony'
  return `<div class="row${key ? ' key' : ''}${cer ? ' cerrow' : ''}">
    <div class="r-t">${esc(it.time || '')}</div>
    <div class="r-b"><div class="r-title">${key ? '<span class="kbadge">Keynote</span>' : ''}${esc(it.title.replace(/^Key ?Note Address:\s*/i, ''))}</div>${it.speaker ? `<div class="r-sp">${esc(it.speaker)}</div>` : ''}</div>
  </div>`
}

function splitAtLunch(items: readonly ScheduleItem[]) {
  const i = items.findIndex((x) => /^lunch$/i.test(x.title))
  return i < 0 ? [items, []] : [items.slice(0, i + 1), items.slice(i + 1)]
}
const dayPage = (d: typeof d1, tag: string, part: string, items: readonly ScheduleItem[], first: boolean) =>
  page(`
  <div class="dayhead"><span class="daytag">${tag}</span><div><div class="dh-date">${esc(weekday(d.date))}</div><div class="dh-venue">${esc(d.venue)} · ${part}</div></div></div>
  ${first ? '' : ''}
  <div class="tt">${items.map(rowHtml).join('')}</div>`)

const [d1a, d1b] = splitAtLunch(d1.items)
const [d2a, d2b] = splitAtLunch(d2.items)

/* ------------------------------------------------- breakthrough + venues */
const lastPage = page(`
  <div class="kicker">Hall B · in parallel</div>
  <h2 class="h2">Breakthrough <span>Sessions</span></h2>
  <p class="lede">Running alongside the main scientific programme in Hall A — technology demonstrations, forums and alumni meetings.</p>
  <div class="bt">${breakthroughTopics.map((t, i) => `<div class="bt-i"><span>${String(i + 1).padStart(2, '0')}</span>${esc(t)}</div>`).join('')}</div>
  <div class="venues">
    ${venues.map((v, i) => `<div class="v"><div class="v-tag">${i === 0 ? 'Day 0 · 23 Oct' : 'Days 1 & 2 · 24 – 25 Oct'}</div><div class="v-name">${esc(v.full)}</div><div class="v-addr">${esc(v.address)}</div></div>`).join('')}
  </div>
  <div class="contact">
    <div><b>Conference Secretariat</b>${esc(secretariat.department)}, ${esc(secretariat.city)} · ${esc(secretariat.email)}<br>${secretariat.phones.map((p) => `${esc(p.name)} · +91 ${esc(p.number)}`).join('   ·   ')}</div>
    <div><b>${esc(registrationHelpline.label)}</b>${esc(registrationHelpline.name)} · +91 ${esc(registrationHelpline.number)}</div>
  </div>
`)

/* ----------------------------------------------------------------- css */
const CSS = `
${fontFaces}
*{margin:0;padding:0;box-sizing:border-box}
:root{--crimson:#B3122A;--deep:#8B0000;--wine:#5F0717;--gold:#A9793A;--goldsoft:#E3D3B5;--ivory:#FBF7F1;--blush:#F8E9ED;--ink:#17120F;--soft:#6A545A;--line:rgba(139,0,0,.14)}
@page{size:210mm 297mm;margin:0}
html,body{font-family:'Barlow',sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:210mm;height:297mm;overflow:hidden;page-break-after:always;background:var(--ivory)}
.page:last-child{page-break-after:auto}
.ph{position:absolute;top:0;left:0;right:0;height:19mm;padding:0 14mm;display:flex;align-items:center;justify-content:space-between;border-bottom:.6mm solid var(--crimson);background:#fff}
.ph img{height:12.5mm}
.ph span{font-family:'BarlowCondensed';font-weight:600;font-size:8pt;letter-spacing:.2em;text-transform:uppercase;color:var(--soft)}
.pad{position:absolute;top:25mm;left:14mm;right:14mm;bottom:17mm}
.pf{position:absolute;left:14mm;right:14mm;bottom:6.5mm;display:flex;justify-content:space-between;border-top:.25mm solid var(--goldsoft);padding-top:2mm;font-family:'BarlowCondensed';font-weight:600;font-size:7.6pt;letter-spacing:.16em;text-transform:uppercase;color:var(--soft)}
.pf .pg{color:var(--crimson)}
.kicker{font-family:'BarlowCondensed';font-weight:700;font-size:10pt;letter-spacing:.32em;text-transform:uppercase;color:var(--gold)}
.h2{font-family:'Anton';font-weight:400;font-size:32pt;line-height:1;text-transform:uppercase;color:var(--ink);margin-top:1mm}
.h2 span{color:var(--crimson)}
.lede{font-size:10.5pt;line-height:1.45;color:#3a2f2a;margin-top:2.5mm;max-width:160mm}
.note{margin-top:5mm;font-size:9.5pt;color:#3a2f2a;border-left:1mm solid var(--gold);padding:2mm 3mm;background:#fff}
.note b{color:var(--crimson)}

/* cover */
.cover{background:#F8F3ED}
.cv-art{position:absolute;inset:0;width:210mm;height:297mm;object-fit:cover;display:block}
.cv-mask{position:absolute;background:#F8F3ED}
.cv-logo{position:absolute;left:9.5mm;top:16.6mm;height:28mm}
.cv-title{position:absolute;left:9.6mm;top:277.4mm;width:130mm;height:13mm;display:flex;align-items:center;white-space:nowrap;overflow:hidden;font-family:'Anton';font-weight:400;letter-spacing:.24em;text-transform:uppercase;color:#17120F;line-height:1}
.cv-title .r{color:#9B0F1E}

/* at a glance */
.g-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4.5mm;margin-top:6mm}
.g-col{background:#fff;border:.25mm solid var(--line);border-top:1.2mm solid var(--crimson);border-radius:1.5mm;padding:4mm 3.6mm}
.g-tag{font-family:'Anton';font-size:20pt;color:var(--crimson);line-height:1}
.g-date{font-family:'BarlowCondensed';font-weight:700;font-size:10pt;letter-spacing:.06em;text-transform:uppercase;margin-top:1.5mm}
.g-venue{font-size:8pt;color:var(--soft);margin-top:.6mm;line-height:1.3}
.g-col ul{list-style:none;margin-top:3mm}
.g-col li{display:flex;flex-direction:column;padding:1.7mm 0;border-top:.2mm solid var(--line)}
.g-t{font-family:'BarlowCondensed';font-weight:600;font-size:8.6pt;color:var(--crimson)}
.g-l{font-size:9.4pt;font-weight:600;line-height:1.2}
.g-break .g-l,.g-break .g-t{color:var(--soft);font-weight:500}
.g-panel .g-l,.g-ceremony .g-l,.g-special .g-l{color:var(--wine)}

/* day head */
.dayhead{display:flex;align-items:center;gap:4mm}
.daytag{font-family:'Anton';font-size:21pt;color:#fff;background:var(--crimson);padding:1.2mm 4mm;border-radius:1.2mm;letter-spacing:.02em}
.daytag.gold{background:var(--gold)}
.dh-date{font-family:'BarlowCondensed';font-weight:700;font-size:13pt;letter-spacing:.06em;text-transform:uppercase}
.dh-venue{font-size:9pt;color:var(--soft)}

/* workshop */
.halls{display:grid;grid-template-columns:1fr 1fr;gap:5mm;margin-top:5mm}
.hall{background:#fff;border:.25mm solid var(--line);border-radius:1.5mm;overflow:hidden}
.hall-h{font-family:'Anton';font-size:16pt;color:#fff;background:var(--wine);padding:2mm 4mm;letter-spacing:.03em}
.hr{display:flex;gap:3mm;padding:3mm 4mm;border-top:.2mm solid var(--line)}
.hr:first-of-type{border-top:0}
.hr-t{flex:0 0 22mm;font-family:'BarlowCondensed';font-weight:600;font-size:9pt;color:var(--crimson)}
.hr-title{font-weight:700;font-size:10pt;line-height:1.25}
.hr-fac{font-size:8.6pt;color:var(--gold);font-weight:600;margin-top:.8mm;line-height:1.3}
.breakline{margin-top:5mm;text-align:center;font-family:'BarlowCondensed';font-weight:600;font-size:10pt;letter-spacing:.12em;text-transform:uppercase;color:var(--soft)}
.breakline span{color:var(--crimson);margin-right:2mm;font-weight:700}

/* timetable */
.tt{margin-top:4mm}
.sess{margin-top:2.6mm;break-inside:avoid}
.sess-band{background:linear-gradient(90deg,var(--crimson),var(--deep));color:#fff;padding:1.6mm 3.4mm;border-radius:1.2mm 1.2mm 0 0}
.sess-name{font-family:'Anton';font-size:12.5pt;letter-spacing:.06em;text-transform:uppercase}
.sess-chairs{background:var(--blush);padding:1.5mm 3.4mm;font-size:8.4pt;line-height:1.35;color:#3a2f2a;border-radius:0 0 1.2mm 1.2mm}
.sess-chairs b{font-family:'BarlowCondensed';font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--wine);font-size:7.8pt;margin-right:1.5mm}
.row{display:flex;gap:3mm;padding:1.25mm 0;border-bottom:.2mm solid var(--line);break-inside:avoid}
.r-t{flex:0 0 27mm;font-family:'BarlowCondensed';font-weight:600;font-size:9pt;color:var(--crimson);padding-top:.25mm}
.r-title{font-weight:600;font-size:9.6pt;line-height:1.25;color:var(--ink)}
.r-sp{font-size:8.4pt;font-weight:600;color:var(--gold);margin-top:.4mm}
.row.key{background:#fff;border:.25mm solid var(--goldsoft);border-radius:1.2mm;padding:2mm 2.4mm;margin-top:1.2mm}
.kbadge{display:inline-block;font-family:'BarlowCondensed';font-weight:700;font-size:7.4pt;letter-spacing:.16em;text-transform:uppercase;color:#fff;background:var(--gold);border-radius:.8mm;padding:.2mm 1.6mm;margin-right:2mm;vertical-align:1px}
.brk{display:flex;gap:3mm;align-items:center;padding:1.7mm 0;margin:1.2mm 0;border-top:.3mm dashed var(--goldsoft);border-bottom:.3mm dashed var(--goldsoft)}
.brk-t{flex:0 0 27mm;font-family:'BarlowCondensed';font-weight:600;font-size:9pt;color:var(--soft)}
.brk-l{font-family:'BarlowCondensed';font-weight:700;font-size:10pt;letter-spacing:.22em;text-transform:uppercase;color:var(--soft)}
.feature{margin-top:2.4mm;background:#fff;border:.25mm solid var(--line);border-left:1.3mm solid var(--wine);border-radius:1.2mm;padding:2.4mm 3.2mm;break-inside:avoid}
.f-top{display:flex;align-items:center;gap:3mm}
.f-t{font-family:'BarlowCondensed';font-weight:600;font-size:9pt;color:var(--crimson)}
.f-badge{font-family:'BarlowCondensed';font-weight:700;font-size:7.4pt;letter-spacing:.16em;text-transform:uppercase;color:#fff;background:var(--wine);border-radius:.8mm;padding:.2mm 1.6mm}
.f-title{font-weight:700;font-size:10.2pt;line-height:1.25;margin-top:1.2mm}
.f-people{font-size:8.6pt;line-height:1.4;color:#3a2f2a;margin-top:.8mm}
.f-people b,.f-label{font-family:'BarlowCondensed';font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--wine);font-size:7.8pt;margin-right:1.5mm}
.f-label{display:block;margin-top:1.4mm}
.guests{display:grid;grid-template-columns:repeat(3,1fr);gap:.6mm 3mm;margin-top:.8mm}
.guests span{font-size:8.6pt;font-weight:600}
.cer{border-left-color:var(--gold)}
.cer .f-badge{background:var(--gold)}

/* breakthrough + venues */
.bt{display:grid;grid-template-columns:1fr 1fr;gap:2.4mm;margin-top:5mm}
.bt-i{display:flex;gap:3mm;align-items:baseline;background:#fff;border:.25mm solid var(--line);border-radius:1.2mm;padding:2.6mm 3.2mm;font-weight:600;font-size:9.6pt;line-height:1.3}
.bt-i span{font-family:'Anton';font-size:12pt;color:var(--crimson);flex:0 0 7mm}
.venues{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:7mm}
.v{border-top:1mm solid var(--gold);padding-top:2.4mm}
.v-tag{font-family:'BarlowCondensed';font-weight:700;font-size:8.6pt;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.v-name{font-weight:700;font-size:10.5pt;margin-top:.8mm}
.v-addr{font-size:8.8pt;color:var(--soft);margin-top:.4mm}
.contact{display:grid;grid-template-columns:1.6fr 1fr;gap:4mm;margin-top:6mm;font-size:8.8pt;line-height:1.5;color:#3a2f2a}
.contact b{display:block;font-family:'BarlowCondensed';font-weight:700;font-size:8.6pt;letter-spacing:.16em;text-transform:uppercase;color:var(--crimson)}
`

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>IACTS TechnoCollege CME 2026 — Scientific Programme</title>
<style>${CSS}</style></head><body>
${cover}
${glancePage}
${workshopPage}
${dayPage(d1, 'Day 1', 'Morning', d1a, true)}
${dayPage(d1, 'Day 1', 'Afternoon & Evening', d1b, false)}
${dayPage(d2, 'Day 2', 'Morning', d2a, true)}
${dayPage(d2, 'Day 2', 'Afternoon', d2b, false)}
${lastPage}
</body></html>`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, html)
console.log(`wrote ${OUT} — ${pageNo + 1} pages`)
