/**
 * The committee's scientific schedule (final, 22 October 2026), set as a printable
 * A4-landscape table in the event's colours: crimson, ivory, gold and black.
 *
 *   node scripts/schedule-print/build.mjs && node scripts/schedule-print/render.mjs "<output.pdf>"
 *
 * Same content and same table as the committee's PDF (Timings · S. No. · Name ·
 * Session Topic). Only spelling slips and spacing are tidied — see FIXES below;
 * names, timings and order are exactly as sent.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const LOGO = '../../../public/brand/iacts-technocollege-2026-logo.png'
const FONTS = '../../trade-brochure/assets/base.css'

/* Tidied from the committee's PDF:
   Pediartic → Pediatric (×2) · Veinn → Vein · "Venue:DR.MCRHRDINSTITUTE" spaced ·
   missing spaces after "Dr." and commas · "Abstracts" numbered 10 in the
   Breakthrough list · times written one way (8.30 – 8.50 am). */

// ── rows ─────────────────────────────────────────────────────────────────────
const T = (time, n, name, topic) => ({ k: 'talk', time, n, name, topic })
const SES = (title, chairs) => ({ k: 'session', title, chairs })
const BRK = (time, label) => ({ k: 'break', time, label })

const day1 = {
  title: 'Day 1', date: 'Saturday, 24 October 2026',
  venue: 'Dr. MCR HRD Institute Auditorium (Hall A), Hyderabad',
}
const day2 = { ...day1, title: 'Day 2', date: 'Sunday, 25 October 2026' }

const pages = [
  { day: day1, rows: [
    SES('Session 1', 'Dr. Vinayak Shukla, Dr. Prasanna Simha Rao, Dr. Rajashekar KV, Dr. Rakesh Naik L'),
    T('8.30 – 8.50 am', 1, 'Dr. Praveen Varma', 'Aortic Root Anatomy for the Modern Times'),
    T('8.50 – 9.10 am', 2, 'Dr. Vikram Reddy', 'A Beginner’s Guide to an Aortic Surgery Programme'),
    T('9.10 – 9.30 am', 3, 'Dr. P V Naresh', 'Newer Hardware - Simplifying Complex Aortic Surgeries'),
    T('9.30 – 9.50 am', 4, 'Dr. Tushar Dhopade', 'Surgeon Driven Structural Heart Programme'),
    SES('Session 2', 'Dr. RV Kumar, Dr. Vijay Grover, Dr. K Ganapathy Subramaniam, Dr. Vivek Tewarson'),
    T('9.50 – 10.10 am', 5, 'Dr. Devagourou Velayoudam', 'The Narrow Aortic Root'),
    T('10.10 – 10.30 am', 6, 'Dr. Gopichand Mannam', 'The Frozen Elephant Trunk'),
    T('10.30 – 10.50 am', 7, 'Dr. Lokeshwar Rao Sajja', 'Predict Trial - India’s Own Trial Comparing Grafting Strategies'),
    T('10.50 – 11.10 am', 8, 'Dr. B Bhaskar Rao', 'The Entrepreneurial Cardiac Surgeon - From Clinical Expertise to Creating Value'),
    { k: 'ceremony', time: '11.10 am – 12.10 pm', title: 'Inaugural Ceremony', guests: [
      'Dr. Satyajit Bose', 'Dr. Jacob Jamesraj', 'Dr. P N Rao', 'Dr. S Vengal Reddy', 'Dr. Chirag Doshi',
      'Dr. Rahul Devraj', 'Dr. P. Chandrashekar', 'Dr. Amaresh Rao M', 'Dr. Abhijeet M Dashetwar'] },
    { ...T('', 9, 'Dr. Chirag Doshi', 'Strategic Roadmap For Young Cardiac Surgeons'), badge: 'Keynote Address' },
  ] },
  { day: day1, cont: true, rows: [
    SES('Session 3', 'Dr. Dharma Rakshak, Dr. Satya Sridhar K, Dr. Manish Pangi, Dr. Renjith S'),
    T('12.10 – 12.30 pm', 10, 'Dr. Satyajit Bose', 'Valve Sparing Aortic Root Surgeries'),
    T('12.30 – 12.50 pm', 11, 'Dr. Niranjan Hiremath', 'Hybrid Arch Procedures'),
    BRK('12.50 – 1.35 pm', 'Lunch'),
    SES('Session 4', 'Dr. G Ramasubrahmanyam, Dr. Namrata Gaur, Dr. Sandeep Khanzode, Dr. Rashmi Arunkumar'),
    T('1.35 – 1.55 pm', 12, 'Dr. Manoj Durairaj', 'Beginner’s Guide to Starting a Thoracic Organ Transplant Program'),
    T('1.55 – 2.15 pm', 13, 'Dr. Sandeep Attawar', 'Mechanical Circulatory Support & Thoracic Transplant: Where do Young Surgeons fit in?'),
    T('2.15 – 2.35 pm', 14, 'Dr. Maruti Haranal', 'Complex Redo’s and The Changing Face of Pediatric Cardiac Surgery'),
    T('2.35 – 2.55 pm', 15, 'Dr. P. Rajashekar', 'Pediatric Aortic and Mitral Valve Repairs'),
    T('2.55 – 3.15 pm', 16, 'Dr. Alla Gopala Krishna Gokhale', 'Heart Transplant in Borderline Recipients'),
    T('3.15 – 3.35 pm', 17, 'Dr. Dhaval Naik', 'Starting an LVAD Program'),
    BRK('3.35 – 3.50 pm', 'High Tea Break'),
  ] },
  { day: day1, cont: true, rows: [
    SES('Session 5', 'Dr. N Nageshwar Rao, Dr. Krishna Prasad, Dr. S Vengal Reddy, Dr. Sai Krishna C'),
    T('3.50 – 4.10 pm', 18, 'Dr. Balasubramoniam KR', 'Workflow of Lung Transplant'),
    T('4.10 – 4.30 pm', 19, 'Dr. C S Hiremath', 'Evolution of Homograft Valve Bank in India'),
    T('4.30 – 4.50 pm', 20, 'Dr. Sridhar Bodapati', 'AI as Surgeon’s Practice Co-pilot: Evidence, Planning, Communication & Research'),
    T('4.50 – 5.05 pm', 21, 'Dr. Prashant Vaijyanath', 'Transcatheter Structural Heart Interventions'),
    T('5.05 – 5.20 pm', 22, 'Dr. Prashant Vaijyanath', 'The Active Role of the Endo-Cardiovascular Surgeon in the Heart Team'),
    { k: 'panel', time: '5.20 – 5.50 pm', topic: 'Legal Issues in a Cardiac Surgeon Driven Structural Heart Program',
      panelists: 'Dr. Prashant Vaijyanath, Dr. Shailesh Jain, Dr. Tushar Dhopade, Dr. Varun G' },
    { k: 'special', time: '5.50 pm', label: 'Quiz', n: 23, name: 'Dr. Vinitha Nair', topic: 'Quiz Master' },
    { k: 'gala', time: '7.30 – 10.30 pm', label: 'Gala Dinner' },
  ] },
  { day: day2, rows: [
    SES('Session 6', 'Dr. Vinayak Shukla, Dr. Sanjeev Rao, Dr. Pramod Reddy K'),
    T('8.30 – 8.50 am', 1, 'Dr. Sai Kiran', 'Beginner’s Guide to Start MICS Valvular Heart Surgery'),
    T('8.50 – 9.10 am', 2, 'Dr. Harish Badami', 'Transitioning from Open to MICS to Robotics'),
    T('9.10 – 9.30 am', 3, 'Dr. Nitin Kumar Rajput', 'How to Avoid Injuries to IMA in Robotics and MICS'),
    T('9.30 – 9.50 am', 4, 'Dr. Nitin Kumar Rajput', 'How to Select Targets for CABG in MICS'),
    SES('Session 7', 'Dr. Amarendra Singh, Dr. Vedanth, Dr. Rhazane Nalluri, Dr. Chandana N C'),
    T('9.50 – 10.10 am', 5, 'Dr. Nagesh Ayalasomayajula', 'Robotic BIMA and Multivessel Grafting - The Controversies and the Answers'),
    T('10.10 – 10.30 am', 6, 'Dr. Alla Gopala Krishna Gokhale', 'Selecting Instrumentation for MICS and Robotics'),
    BRK('10.30 – 10.40 am', 'Tea Break'),
    T('10.40 – 11.00 am', 7, 'Dr. John Murala', 'Man & Machine - The Next Industrial Revolution in Cardiac Surgery'),
    T('11.00 – 11.20 am', 8, 'Dr. Sudhir Srivastava', 'Analysis of First 195 Multi-Speciality Telesurgery Cases. How Technology will Democratize Access'),
  ] },
  { day: day2, cont: true, rows: [
    SES('Session 8', 'Dr. Usha Rani, Dr. Venkat Reddy K, Dr. Gopi Nallaiyan, Dr. Narmada'),
    T('11.20 – 11.40 am', 9, 'Dr. Jacob Jamesraj', 'Anastomotic Disasters: Recognition and Management'),
    T('11.40 am – 12.00 pm', 10, 'Dr. Sanjay Theodore', 'Graft Flow Measurement & Transit-Time Flow Measurement (TTFM)'),
    T('12.00 – 12.10 pm', 11, 'Dr. Archana Pathy', 'Enhanced Recovery After Surgery'),
    T('12.10 – 12.30 pm', 12, 'Dr. Smruti Ranjan Mohanty', 'Closed Technique is the Way Forward in Arterial Switch Operation'),
    { k: 'panel', time: '12.30 – 1.00 pm', n: 13, moderator: 'Dr. Debasis Das',
      topic: 'Pediatric Cardiac Program and the Pediatric Surgeon - The Art, Science & Economics',
      panelists: 'Dr. Smruti Ranjan Mohanty, Dr. K Ganapathy Subramaniam, Dr. Sunil Kumar Swain, Dr. Sandeep Khanzode, Dr. P. Rajashekar' },
    BRK('1.00 – 1.45 pm', 'Lunch'),
  ] },
  { day: day2, cont: true, rows: [
    SES('Session 9', 'Dr. Satya Bhaskar Raju, Dr. Avinash Dal, Dr. Madasu Sudhakar Rao, Dr. Siddarth Sathia, Dr. Kalluri Sriram'),
    T('1.45 – 2.05 pm', 14, 'Dr. Ramprassath', 'No Robo? - Start an Endoscopic Cardiac Surgery'),
    T('2.05 – 2.25 pm', 15, 'Dr. Paneer Selvam Krishnamoorthy', 'Complex Mitral Valve Repairs'),
    T('2.25 – 2.45 pm', 16, 'Dr. Balasubramoniam KR', 'Thoracic Surgery as a Great Career Choice'),
    T('2.45 – 3.05 pm', 17, 'Dr. Manjunath Bale', 'How to Start Robotic Thoracic Surgery Programme'),
    T('3.05 – 3.25 pm', 18, 'Dr. Arvind Muthirevula', 'Building the Future Surgeon: Robotics, Reconstruction, and Beyond'),
    BRK('3.25 – 3.40 pm', 'High Tea Break'),
    { k: 'panel', time: '3.40 – 4.10 pm', n: 19, moderator: 'Dr. Vishal Khante',
      topic: 'Robotic Cardiac Surgery: Future Gold Standard or Mere Hype?',
      panelists: 'Dr. Alla Gopala Krishna Gokhale, Dr. P N Rao, Dr. Nitin Kumar Rajput, Dr. Nagesh Ayalasomayajula' },
    T('4.10 – 4.30 pm', 20, 'Dr. Randolph Wong', 'The Commando Procedure - Video Presentation'),
    T('4.30 – 4.50 pm', 21, 'TSMC', 'Medical Ethics / Good Clinical Practice / Lab Practice / Legal Issues'),
    { k: 'gala', time: '4.50 – 5.00 pm', label: 'Valedictory' },
  ] },
]

const breakthrough = [
  'Young Surgeon’s Forum', 'Women in Cardiothoracic Surgery',
  'Demo on Endoscopic Saphenous Vein and Radial Artery Harvest', 'ECMO, Cell Saver', 'Centri Mag, LVAD',
  'Perceval Sutureless Valve - Demo and Implantation', 'NIMS Alumni Get Together', 'AIIMS Alumni Get Together',
  'Sri Jayadeva Institute of Cardiovascular Sciences and Research Alumni Get Together', 'Abstracts',
]

// ── html ─────────────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const total = pages.length + 1

function row(r) {
  switch (r.k) {
    case 'session':
      return `<tr class="ses"><td colspan="4"><span class="st">${esc(r.title)}</span><span class="ch"><b>Chairpersons</b> ${esc(r.chairs)}</span></td></tr>`
    case 'talk':
      return `<tr class="talk"><td class="tm">${esc(r.time)}</td><td class="no">${r.n}</td><td class="nm">${esc(r.name)}</td>
        <td class="tp">${r.badge ? `<span class="badge">${esc(r.badge)}</span>` : ''}${esc(r.topic)}</td></tr>`
    case 'break':
      return `<tr class="brk"><td class="tm">${esc(r.time)}</td><td colspan="3">${esc(r.label)}</td></tr>`
    case 'ceremony':
      return `<tr class="cer"><td class="tm">${esc(r.time)}</td><td></td><td colspan="2">
        <div class="lbl">${esc(r.title)}</div><div class="guests">${r.guests.map((g) => `<span>${esc(g)}</span>`).join('')}</div></td></tr>`
    case 'panel':
      return `<tr class="pan"><td class="tm">${esc(r.time)}</td><td class="no">${r.n ?? ''}</td><td class="nm">
        <div class="lbl">Panel Discussion</div>${r.moderator ? `<div class="mod"><i>Moderator</i>${esc(r.moderator)}</div>` : ''}</td>
        <td class="tp"><div class="ptitle">${esc(r.topic)}</div><div class="pl"><i>Panelists</i> ${esc(r.panelists)}</div></td></tr>`
    case 'special':
      return `<tr class="spc"><td class="tm">${esc(r.time)}</td><td colspan="3" class="lbl">${esc(r.label)}</td></tr>
        <tr class="talk"><td class="tm"></td><td class="no">${r.n}</td><td class="nm">${esc(r.name)}</td><td class="tp">${esc(r.topic)}</td></tr>`
    case 'gala':
      return `<tr class="gala"><td class="tm">${esc(r.time)}</td><td colspan="3">${esc(r.label)}</td></tr>`
  }
}

const head = (n) => `
  <header class="hd">
    <img src="${LOGO}" alt="IACTS TechnoCollege CME 2026">
    <div class="hd-r"><div class="hd-t">Scientific <span>Schedule</span></div>
      <div class="hd-s">IACTS TechnoCollege CME 2026 &nbsp;·&nbsp; The Future Is Now</div></div>
  </header>
  <footer class="ft"><span><b>IACTS TechnoCollege CME 2026</b> &nbsp;·&nbsp; 23 – 25 October 2026 &nbsp;·&nbsp; Hyderabad</span>
    <span>iactstechnocollegecme2026.com</span><span class="pg">Page ${n} of ${total}</span></footer>`

const dayBar = (d, cont) => `
  <div class="day"><div class="dl"><span class="dt">${d.title}</span><span class="dd">${d.date}${cont ? ' <em>(continued)</em>' : ''}</span></div>
    <div class="dv">${esc(d.venue)}</div></div>`

const thead = `<thead><tr><th class="tm">Timings</th><th class="no">S. No.</th><th class="nm">Name</th><th class="tp">Session Topic</th></tr></thead>`

const body = pages.map((p, i) => `
<section class="page sp">${head(i + 1)}
  <div class="pad">${dayBar(p.day, p.cont)}
    <table>${thead}<tbody>${p.rows.map(row).join('')}</tbody></table>
  </div>
</section>`).join('') + `
<section class="page sp">${head(total)}
  <div class="pad">
    <div class="day"><div class="dl"><span class="dt">Breakthrough Sessions</span><span class="dd">Hall B</span></div>
      <div class="dv">Runs in parallel with the scientific programme</div></div>
    <table class="bt"><thead><tr><th class="no">S. No.</th><th class="tp">Topic Name</th></tr></thead><tbody>
      ${breakthrough.map((t, i) => `<tr class="talk"><td class="no">${i + 1}</td><td class="nm">${esc(t)}</td></tr>`).join('')}
    </tbody></table>
  </div>
</section>`

const css = `
@page{size:297mm 210mm;margin:0}
.page.sp{width:297mm;height:210mm;background:#FBF7F1;position:relative;overflow:hidden}
.sp .pad{position:absolute;top:22mm;left:11mm;right:11mm;bottom:12.5mm}
.hd{position:absolute;left:0;right:0;top:0;height:18mm;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 11mm}
.hd::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1.1mm;background:linear-gradient(90deg,#5F0717,#B3122A 55%,#A9793A)}
.hd img{height:13.5mm;display:block}
.hd-r{text-align:right}
.hd-t{font-family:'Anton';font-size:20pt;letter-spacing:.07em;text-transform:uppercase;color:#17120F;line-height:1}
.hd-t span{color:#B3122A}
.hd-s{font-family:'BarlowCondensed';font-weight:600;font-size:8.5pt;letter-spacing:.2em;text-transform:uppercase;color:#A9793A;margin-top:1.2mm}
.ft{position:absolute;left:0;right:0;bottom:0;height:9mm;background:#17120F;display:flex;align-items:center;justify-content:space-between;padding:0 11mm;
  font-family:'BarlowCondensed';font-weight:600;font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:#E3D3B5}
.ft b{color:#fff;font-weight:700}
.ft .pg{color:#E8B86A}
.day{display:flex;align-items:center;justify-content:space-between;background:#17120F;color:#fff;padding:2.2mm 4mm;border-left:2mm solid #A9793A}
.dl{display:flex;align-items:baseline;gap:3mm}
.dt{font-family:'Anton';font-size:15pt;letter-spacing:.06em;text-transform:uppercase;color:#E8B86A}
.dd{font-family:'Barlow';font-weight:600;font-size:11pt}
.dd em{font-style:normal;font-weight:500;color:#cfc3b3;font-size:9.5pt}
.dv{font-family:'BarlowCondensed';font-weight:600;font-size:9.5pt;letter-spacing:.08em;text-transform:uppercase;color:#E3D3B5}
table{width:100%;border-collapse:collapse;font-family:'Barlow';font-size:10.6pt;color:#17120F;table-layout:fixed}
thead th{background:#E3D3B5;color:#17120F;font-family:'BarlowCondensed';font-weight:700;font-size:9.4pt;letter-spacing:.16em;text-transform:uppercase;padding:1.6mm 2.5mm;text-align:left;border-bottom:.5mm solid #A9793A}
th.tm,td.tm{width:37mm}
th.no,td.no{width:17mm;text-align:center;white-space:nowrap}
th.nm{width:74mm}
.bt th.no,.bt td.no{width:20mm}
td{padding:2.35mm 2.5mm;vertical-align:middle;border-bottom:.25mm solid #EADFCF}
tr.talk:nth-child(even) td{background:#fff}
td.tm{font-family:'BarlowCondensed';font-weight:700;font-size:11pt;color:#8B0000;white-space:nowrap}
td.no{font-family:'BarlowCondensed';font-weight:700;color:#A9793A;font-size:11.5pt}
td.nm{font-weight:700}
.badge{display:inline-block;font-family:'BarlowCondensed';font-weight:700;font-size:8.4pt;letter-spacing:.14em;text-transform:uppercase;background:#A9793A;color:#fff;border-radius:1mm;padding:.3mm 1.6mm;margin-right:2mm;vertical-align:1px}
tr.ses td{background:linear-gradient(90deg,#B3122A,#8B0000);color:#fff;padding:2.2mm 4mm;border:0}
tr.ses .st{font-family:'Anton';font-size:14pt;letter-spacing:.08em;text-transform:uppercase;margin-right:4mm}
tr.ses .ch{font-size:10.2pt}
tr.ses .ch b{font-family:'BarlowCondensed';font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#F3DDB0;font-size:8.2pt;margin-right:1.5mm}
tr.brk td{background:#F3E7D3;border-top:.25mm solid #D9C29C;border-bottom:.25mm solid #D9C29C}
tr.brk td:last-child{font-family:'BarlowCondensed';font-weight:700;font-size:11.5pt;letter-spacing:.3em;text-transform:uppercase;color:#875318;text-align:center}
tr.cer td,tr.pan td{background:#F8E9ED}
.lbl{font-family:'BarlowCondensed';font-weight:700;font-size:10.5pt;letter-spacing:.2em;text-transform:uppercase;color:#B3122A}
.guests{display:grid;grid-template-columns:repeat(3,1fr);gap:.6mm 4mm;margin-top:1.2mm;font-weight:600;font-size:10.2pt}
.mod{font-weight:700;margin-top:.6mm}
.mod i,.pl i{font-style:normal;font-family:'BarlowCondensed';font-weight:700;font-size:8pt;letter-spacing:.12em;text-transform:uppercase;color:#A9793A;margin-right:1.5mm}
.mod i{display:block}
.ptitle{font-weight:700}
.pl{margin-top:.8mm;font-size:10pt}
tr.spc td{background:#F8E9ED}
tr.spc td.lbl{font-size:10pt}
tr.gala td{background:#17120F;color:#E8B86A;border:0}
tr.gala td.tm{color:#E8B86A}
tr.gala td:last-child{font-family:'Anton';font-size:14pt;letter-spacing:.2em;text-transform:uppercase;text-align:center}
.bt{margin-top:0;font-size:12pt}
.bt td{padding:3.6mm 3mm}
`

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Scientific Schedule — IACTS TechnoCollege CME 2026</title>
<link rel="stylesheet" href="${FONTS}"><style>${css}</style></head><body>${body}</body></html>`
mkdirSync(join(HERE, 'out'), { recursive: true })
writeFileSync(join(HERE, 'out/index.html'), html)
console.log(`wrote ${join(HERE, 'out/index.html')} — ${total} pages`)
