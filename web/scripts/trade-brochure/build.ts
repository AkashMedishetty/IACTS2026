/**
 * TRADE BROCHURE — generated, not hand-edited.
 *
 *   npx tsx scripts/trade-brochure/build.ts      -> scripts/trade-brochure/out/index.html
 *   node scripts/trade-brochure/render.mjs <pdf> -> A4 PDF (refuses if any page overflows)
 *
 * V5 was finished in Canva, so its committee and schedule drifted from the
 * site: four of its pages carried the old placeholder programme. This rebuild
 * keeps V5's design — the committee's cover and letterhead artwork, Anton /
 * Barlow type, the draft's own stylesheet — but takes the committee and the
 * scientific schedule from src/data, the same files the website renders. The
 * brochure can no longer disagree with the site; re-run both scripts after any
 * change to those files.
 *
 * Marketing copy (welcome, signature formats, technology labs) is V5's,
 * reproduced as published.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  conference,
  executiveCommittee,
  iactsExecutiveCommittee,
  leadership,
  patrons,
  secretariat,
  venues,
} from '../../src/data/conference'
import { scheduleDays, scheduleStatus, workshopHalls, workshopLunch, breakthroughTopics, breakthroughNote, type ScheduleItem } from '../../src/data/schedule'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, 'out/index.html')
/** out/index.html -> web/public, so committee and venue photos load as files. */
const PUB = '../../../public'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const img = (p: string | null | undefined) => (p ? `${PUB}${p}` : '')

let pageNo = 1
function page(inner: string, opts: { cover?: boolean } = {}): string {
  if (opts.cover) return `<section class="page cover"><img class="coverimg" src="../assets/cover.jpg" alt=""></section>`
  pageNo += 1
  return `<section class="page bg">
  <div class="rhead">Future Is Now · Hyderabad 2026</div>
  <div class="pad">${inner}</div>
  <div class="foot"><span>IACTS TechnoCollege CME 2026</span><span class="pg">${String(pageNo).padStart(2, '0')}</span></div>
</section>`
}

const rule = `<div class="rule"><div class="r1"></div><div class="r2"></div></div>`
const head = (kicker: string, title: string, red = '') =>
  `<div class="kicker">${kicker}</div><div class="h1">${title}${red ? ` <span class="rd">${red}</span>` : ''}</div>${rule}`

/* ------------------------------------------------------------------ pages */

const welcome = page(`
  ${head('Welcome · Conference · Vision', 'The <span class="rd">Future</span><br>Is Now')}
  <p class="lead">On behalf of the <b>Indian Association of Cardiovascular-Thoracic Surgeons</b> and NIMS CVTS, it is our privilege to welcome you to <b>IACTS TechnoCollege CME 2026</b> — a pre-conference workshop and two-day CME built for the next generation of cardiothoracic surgeons.</p>
  <p class="body" style="margin-top:3mm">Cardiothoracic surgery is undergoing a fundamental transformation. Minimally invasive and robotic surgery, advanced aortic interventions, transplantation, mechanical circulatory support, artificial intelligence, digital simulation and surgeon-led innovation are rapidly changing how our specialty is conceived and delivered. TechnoCollege is envisioned as a focused platform for postgraduate trainees, fellows and young surgeons to move beyond conventional didactic learning and engage with the technologies, techniques and ideas that will define the next generation of CVTS practice.</p>
  <div class="kicker red" style="margin-top:6mm">The Programme Combines</div>
  <div style="margin-top:1.5mm">${[
    'High-impact lectures', '“How I Do It” talks', 'Case-based discussions', 'Expert panels',
    'Hands-on surgical labs', 'Technology demos', 'Technology Olympics', 'Young surgeons’ research',
    'Innovation showcase', 'AI &amp; digital surgery', 'Entrepreneurship &amp; finance', 'Industry–surgeon interaction',
  ].map((c) => `<span class="chip big">${c}</span>`).join('')}</div>
  <div class="bottom">${rule}<div class="mantra">Learn it. <span class="s">Do it.</span> Challenge it. <span class="s">Innovate it.</span></div></div>
`)

const venueCard = (v: (typeof venues)[number], tag: string, cls: string, line1: string, line2: string) => `
  <div class="vcard">
    <img class="vimg" src="${img(v.image)}" alt="">
    <div class="vbody">
      <span class="daytag ${cls}">${tag}</span>
      <div class="vname">${esc(v.name)}</div>
      <div class="vsub">${line1}</div>
      <div class="vaddr">${esc(v.address)}</div>
      <div class="vwhen">${line2}</div>
    </div>
  </div>`

const venuesPage = page(`
  ${head('Where It Happens', 'The', 'Venues')}
  <p class="lead">Two landmark institutions across Hyderabad host the workshop and the scientific programme — chosen for world-class surgical facilities and auditoria built for immersive learning.</p>
  <div class="vgrid">
    ${venueCard(venues[0], 'Day 0', 'd0', 'Nizam’s Institute of Medical Sciences', 'Pre-Conference Workshop · 23 Oct 2026')}
    ${venueCard(venues[1], 'Day 1 · 2', 'd1', 'Auditorium · HRD Institute of Telangana', 'Scientific Programme · 24–25 Oct 2026')}
  </div>
  <div class="panel" style="max-width:110mm;margin:6mm auto 0">
    <div class="pt">Getting There</div>
    <div class="pb">Both venues are centrally located in Hyderabad with easy access from Rajiv Gandhi International Airport and the city centre. Detailed travel notes and recommended stays will be shared with registered delegates.</div>
  </div>
`)

const person = (name: string, role?: string, title?: string, src?: string | null, size = 'md') => `
  <div class="person ${size}">
    ${src ? `<img class="por" src="${img(src)}" alt="">` : `<div class="por ph-initials">${esc(name.replace(/^Dr\.?\s+/i, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join(''))}</div>`}
    <div class="pname">${esc(name)}</div>
    ${role ? `<div class="prole">${esc(role)}</div>` : ''}
    ${title ? `<div class="ptitle">${esc(title)}</div>` : ''}
  </div>`

const iactsPage = page(`
  ${head('The Association', 'IACTS Executive', 'Committee')}
  <p class="body">The elected leadership of the Indian Association of Cardiovascular-Thoracic Surgeons.</p>
  <div class="pgrid c5" style="margin-top:5mm">
    ${iactsExecutiveCommittee.map((m) => person(m.name, m.role, undefined, m.portrait)).join('')}
  </div>
`)

const organisingPage = page(`
  ${head('Leadership', 'Organising', 'Committee')}
  <div class="kicker red sub">Patrons</div>
  <div class="pgrid c5 patrons">${patrons.map((p) => person(p.name, p.title, p.role, p.portrait)).join('')}</div>
  <div class="kicker red sub">Office-Bearers</div>
  <div class="pgrid c5">${leadership.map((l) => person(l.name, l.role, l.title, l.portrait)).join('')}</div>
  <div class="kicker red sub">Executive Committee</div>
  <div class="pgrid c6 sm">${executiveCommittee.map((m) => person(m.name, undefined, undefined, m.portrait, 'sm')).join('')}</div>
  <div class="bottom">${rule}<p class="body">Conference Secretariat · ${esc(secretariat.department)}, ${esc(secretariat.city)} · ${esc(secretariat.email)}</p></div>
`)

/* Day summaries describe the committee's final schedule, not V5's draft. */
const highlights = page(`
  ${head('Scientific Programme', 'Highlights', 'At a Glance')}
  <div class="two" style="margin-top:2mm">
    <div>
      <div class="kicker red">Signature Formats</div>
      <ul class="bul">${[
        '“How I Do It” technical presentations', 'Hands-on surgical laboratories &amp; tech demos',
        'Technology Olympics — competitive skills', 'Case battles &amp; expert panels',
        'Young Innovators’ pitch &amp; paper sessions', 'AI, digital twins &amp; simulation',
        'Entrepreneurship &amp; personal finance', 'Industry technology labs',
      ].map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>
    <div>
      <div class="kicker red">Three-Day Flow</div>
      <div class="flow"><span class="daytag d0">Day 0</span><div class="ft">Pre-Conference Workshop</div>
        <div class="fd">Two parallel halls at NIMS — applied anatomy, coronary anastomosis, valve replacement and the proximal anastomosis contest; FET planning and deployment, MICS CABG and endoscopic vein &amp; radial artery harvest.</div></div>
      <div class="flow"><span class="daytag d1">Day 1</span><div class="ft">Aortic, Transplant &amp; Congenital</div>
        <div class="fd">Aortic root to frozen elephant trunk, the keynote address, thoracic transplant and LVAD, pediatric repairs, a structural heart panel, the quiz and gala dinner. Breakthrough Sessions run in parallel.</div></div>
      <div class="flow"><span class="daytag d2">Day 2</span><div class="ft">MICS, Robotics &amp; Thoracic</div>
        <div class="fd">MICS and robotic cardiac surgery, a pediatric programme panel, thoracic and robotic thoracic surgery, the robotic surgery debate, the Commando procedure and the valedictory.</div></div>
    </div>
  </div>
  <div class="bottom">${rule}<div class="mantra" style="font-size:16pt">Operate well · Think critically · <span class="s">Innovate responsibly</span></div></div>
`)

const day0 = page(`
  <div class="dayline"><span class="daytag d0">Day 0 · 23 Oct</span><span class="stime">Pre-Conference Workshop · NIMS</span></div>
  <div class="h1">Hands-On <span class="rd">Workshops</span></div>${rule}
  <p class="body">A capacity-limited, hands-on workshop for postgraduate trainees, fellows and young surgeons. Two halls run in parallel.</p>
  <div class="cardgrid" style="margin-top:4mm">
    ${workshopHalls.map((h) => `
      <div class="card hall">
        <div class="ct">${h.hall}</div>
        <div class="hl">${h.items.map((i) => `<div class="hrow"><div class="htime">${esc(i.time)}</div><div><div class="it">${esc(i.title)}</div><div class="fac">${esc(i.faculty.join(' · '))}</div></div></div>`).join('')}</div>
      </div>`).join('')}
  </div>
  <div class="lunch"><b>Lunch</b> · ${esc(workshopLunch)} · both halls</div>
  <div class="panel" style="margin-top:5mm"><div class="pt">Seats</div><div class="pb">Workshop places are limited and allocated with registration; delegates are written to confirm their place.</div></div>
`)

/* ---------------------------------------------------------- the timetable */

const FEATURE: ScheduleItem['kind'][] = ['panel', 'special']
const QUIET: ScheduleItem['kind'][] = ['break', 'ceremony']

function rows(items: readonly ScheduleItem[]): string {
  let lastTrack = ''
  return items
    .map((it) => {
      let out = ''
      if (it.track && it.track !== lastTrack) out += `<div class="trk">${esc(it.track)}</div>`
      if (it.track) lastTrack = it.track
      const cls = QUIET.includes(it.kind) ? 'brk' : FEATURE.includes(it.kind) ? 'feat' : ''
      const sub = [
        it.speaker ? `<div class="fac">${esc(it.speaker)}</div>` : '',
        it.chairpersons?.length ? `<div class="chair"><b>Chairpersons</b> ${esc(it.chairpersons.join(' · '))}</div>` : '',
      ].join('')
      out += `<div class="trow ${cls}"><div class="tt">${esc(it.time || '')}</div><div class="tdot"><i></i></div><div class="tb"><div class="top">${esc(it.title)}</div>${sub}</div></div>`
      return out
    })
    .join('')
}

function splitAtLunch(items: readonly ScheduleItem[]) {
  const i = items.findIndex((x) => /^lunch$/i.test(x.title))
  return i < 0 ? [items, []] : [items.slice(0, i + 1), items.slice(i + 1)]
}

const [d1, d2] = scheduleDays
const [d1a, d1b] = splitAtLunch(d1.items)
const [d2a, d2b] = splitAtLunch(d2.items)
const status = `<p class="status">${esc(scheduleStatus)}</p>`
const dayHead = (tag: string, cls: string, meta: string, title: string, red: string) =>
  `<div class="dayline"><span class="daytag ${cls}">${tag}</span><span class="stime">${meta}</span></div><div class="h1 sm">${title} <span class="rd">${red}</span></div>${rule}`

const day1a = page(`${dayHead('Day 1 · 24 Oct', 'd1', `Morning · ${esc(d1.venue)}`, 'Aortic Surgery', '&amp; Keynote')}${status}<div class="rail">${rows(d1a)}</div>`)
const day1b = page(`${dayHead('Day 1 · 24 Oct', 'd1', 'Afternoon &amp; Evening', 'Transplant, Congenital', '&amp; Structural')}<div class="rail">${rows(d1b)}</div>
  <div class="panel bt"><div class="pt">Breakthrough Sessions</div><div class="pb">${esc(breakthroughNote)}</div>
    <div style="margin-top:1.4mm">${breakthroughTopics.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></div>`)
const day2a = page(`${dayHead('Day 2 · 25 Oct', 'd2', `Morning · ${esc(d2.venue)}`, 'MICS, Robotics', '&amp; Congenital')}${status}<div class="rail">${rows(d2a)}</div>`)
const day2b = page(`${dayHead('Day 2 · 25 Oct', 'd2', 'Afternoon', 'Thoracic', '&amp; Robotics')}<div class="rail">${rows(d2b)}</div>`)

const labs = page(`
  ${head('Industry × Surgeon', 'Technology', 'Labs')}
  <p class="body">The industry component is designed around <b>hands-on education</b> rather than sponsored lectures — six immersive technology labs run alongside the scientific programme.</p>
  <div class="labs">${[
    ['Robotic Surgery Lab', 'Console · camera control · instrument manipulation · needle driving · suturing · knot tying · emergency undocking'],
    ['Aortic Technology Lab', 'Frozen Elephant Trunk · TEVAR · hybrid arch · proximal anastomotic devices · aortic grafts · cerebral protection'],
    ['Coronary Anastomosis Lab', 'Anastomotic devices · surgical instruments · sutures · beating-heart simulation · microsurgical techniques'],
    ['Thoracic Stapling Lab', 'Vascular · bronchial · parenchymal &amp; difficult-angle stapling · staple-line reinforcement · troubleshooting'],
    ['ECMO &amp; MCS Lab', 'ECMO cannulation · circuit configuration · troubleshooting · LVAD technology · emergency MCS scenarios'],
    ['Digital Surgery Lab', '3-D surgical planning · VR simulation · digital twins · AI-assisted imaging · surgical video analytics'],
  ].map(([t, d]) => `<div class="lab"><div class="lt">${t}</div><div class="li">${d}</div></div>`).join('')}</div>
  ${rule}
  <div class="two contact">
    <div><div class="kicker red">Conference Secretariat</div><p class="body">${esc(secretariat.department)} · NIMS (Nizam’s Institute of Medical Sciences)<br>Punjagutta, Hyderabad, Telangana</p>
      <div class="kicker red" style="margin-top:3mm">Email</div><p class="body">${esc(secretariat.email)}</p></div>
    <div><div class="kicker red">Contact</div>${secretariat.phones.map((p) => `<p class="body">${esc(p.name)} · +91 ${esc(p.number)}</p>`).join('')}</div>
  </div>
  <div class="bottom">${rule}<div class="mantra" style="font-size:16pt">Learn it. <span class="s">Do it.</span> Challenge it. <span class="s">Innovate it.</span></div></div>
`)

/* Additions to the draft stylesheet: cover, photos, venue cards, timetable tracks. */
const EXTRA = `
.cover{padding:0}.coverimg{width:210mm;height:297mm;object-fit:cover;display:block}
.bottom{position:absolute;left:0;right:0;bottom:2mm}
.bottom>:last-child{margin-bottom:0}
.sub{margin-top:4mm;margin-bottom:1.6mm}
.pgrid{display:grid;gap:3.2mm 3mm}
.pgrid.c5{grid-template-columns:repeat(5,1fr)}.pgrid.c6{grid-template-columns:repeat(6,1fr)}
.pgrid.patrons{grid-template-columns:repeat(5,1fr)}
.person{text-align:center;break-inside:avoid}
.por{width:100%;aspect-ratio:4/5;object-fit:cover;object-position:50% 20%;border-radius:1.4mm;border:.25mm solid var(--line);background:#efe4d8;display:block}
.person.md .por{max-width:30mm;margin:0 auto}.person.sm .por{max-width:24mm;margin:0 auto}
.ph-initials{display:flex;align-items:center;justify-content:center;font-family:'Anton';font-size:14pt;color:rgba(139,0,0,.35)}
.pname{font-family:'Barlow';font-weight:700;font-size:8.6pt;line-height:1.15;color:var(--ink);margin-top:1.2mm}
.person.sm .pname{font-size:7.6pt}
.prole{font-family:'BarlowCondensed';font-weight:700;font-size:7pt;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-top:.4mm;line-height:1.2}
.ptitle{font-size:6.8pt;line-height:1.25;color:var(--soft);margin-top:.3mm}
.vgrid{display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:4mm}
.vcard{background:rgba(255,255,255,.55);border:.2mm solid var(--line);border-radius:2mm;overflow:hidden}
.vimg{width:100%;height:58mm;object-fit:cover;display:block}
.vbody{padding:3mm}.vname{font-family:'Anton';font-size:17pt;text-transform:uppercase;margin-top:2mm;line-height:1}
.vsub{font-family:'BarlowCondensed';font-weight:700;font-size:8.6pt;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-top:1.2mm}
.vaddr{font-size:8.8pt;color:#33291f;margin-top:1mm}.vwhen{font-family:'BarlowCondensed';font-weight:700;font-size:8.6pt;letter-spacing:.1em;text-transform:uppercase;color:var(--crimson);margin-top:1.4mm}
.bul{list-style:none;margin-top:2mm}.bul li{font-size:9.6pt;line-height:1.35;padding:1.3mm 0 1.3mm 4mm;position:relative;color:#2b241e}
.bul li:before{content:'▸';position:absolute;left:0;color:var(--gold);font-size:7pt;top:1.8mm}
.flow{background:rgba(255,255,255,.55);border:.2mm solid var(--line);border-radius:2mm;padding:2.6mm 3mm;margin-top:2.4mm}
.flow .ft{font-family:'BarlowCondensed';font-weight:700;font-size:12pt;text-transform:uppercase;margin-top:1.4mm}
.flow .fd{font-size:8.6pt;line-height:1.4;color:#33291f;margin-top:.8mm}
.dayline{display:flex;align-items:center;gap:3mm}
.hall .ct{font-family:'Anton';font-size:15pt;color:var(--red);font-weight:400}
.hl{margin-top:2mm}.hrow{display:flex;gap:2.5mm;padding:1.6mm 0;border-top:.18mm solid var(--line)}
.hrow:first-child{border-top:0}.htime{flex:0 0 22mm;font-family:'BarlowCondensed';font-weight:600;font-size:8.8pt;color:var(--crimson);padding-top:.2mm}
.hl .it{font-size:9.4pt;line-height:1.25;color:#241d18;font-weight:600}
.hl .fac{display:block;font-size:7.9pt;color:var(--gold);font-weight:600;margin-top:.4mm;line-height:1.3}
.lunch{margin-top:3mm;font-family:'BarlowCondensed';font-weight:600;font-size:10pt;letter-spacing:.08em;text-transform:uppercase;color:var(--soft);text-align:center}
.lunch b{color:var(--red)}
.status{font-size:8.4pt;color:var(--crimson);font-weight:600;margin:-.6mm 0 1.2mm}
.trk{font-family:'BarlowCondensed';font-weight:700;font-size:8.4pt;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin:2.4mm 0 .6mm 31mm}
.rail{margin-top:.6mm}.railline{display:none}
.trow{padding:.8mm 0}.tt{width:26mm;flex:0 0 26mm;font-size:8.6pt}
.tb .top{font-size:9pt}.tb .fac{font-size:7.8pt}
.tb .chair{font-size:7.4pt;color:var(--soft);margin-top:.3mm;line-height:1.3}.tb .chair b{color:var(--red);font-weight:700}
.panel.bt{margin-top:3mm}
.labs{display:grid;gap:2mm;margin-top:3mm}
.contact .body{margin-top:.8mm}
`

const base = readFileSync(resolve(HERE, 'assets/base.css'), 'utf8')
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>IACTS TechnoCollege CME 2026 — Trade Brochure</title>
<style>${base}${EXTRA}</style></head><body>
${page('', { cover: true })}
${welcome}${venuesPage}${iactsPage}${organisingPage}${highlights}${day0}${day1a}${day1b}${day2a}${day2b}${labs}
</body></html>`

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, html)
console.log(`wrote ${OUT} — ${pageNo} pages (${conference.name})`)
