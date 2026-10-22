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
import { esc, row, top, foot, document } from './shared.mjs'

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
/* Laid out like the committee's own table — bordered cells, Arial, centred
   session headings and topics — recoloured to the event palette. Built for
   printing: white paper, everything inside 10 mm margins (nothing bleeds to
   the edge, where printers clip), light fills only. */
const total = pages.length + 1

const cols = `<colgroup><col style="width:15%"><col style="width:6%"><col style="width:25%"><col></colgroup>`
const titleRows = `
  <tr class="colh"><th>Timings</th><th>S. No.</th><th>Name</th><th>Session Topic</th></tr>
  <tr class="title"><td colspan="4">SCIENTIFIC SCHEDULE</td></tr>`
const dayRows = (d, cont) => cont ? '' : `
  <tr class="info"><td colspan="4">${d.title} - ${d.date}</td></tr>
  <tr class="info"><td colspan="4">Venue : ${esc(d.venue)}</td></tr>`

const body = pages.map((p, i) => `
<section class="page sp"><div class="pad">${top}
  <table>${cols}<tbody>${titleRows}${dayRows(p.day, p.cont)}${p.rows.map(row).join('')}</tbody></table>
  ${foot(i + 1, total)}</div>
</section>`).join('') + `
<section class="page sp"><div class="pad">${top}
  <table class="bt"><colgroup><col style="width:12%"><col></colgroup><tbody>
    <tr class="title"><td colspan="2">Breakthrough Sessions - Hall B</td></tr>
    <tr class="colh"><th>S. No.</th><th>Topic Name</th></tr>
    ${breakthrough.map((t, i) => `<tr class="talk"><td class="no">${i + 1}</td><td class="tp b">${esc(t)}</td></tr>`).join('')}
    <tr class="info"><td colspan="2">Breakthrough Sessions Run in Parallel with the Scientific Program</td></tr>
  </tbody></table>
  ${foot(total, total)}</div>
</section>`

const html = document('Scientific Schedule — IACTS TechnoCollege CME 2026', body)
mkdirSync(join(HERE, 'out'), { recursive: true })
writeFileSync(join(HERE, 'out/index.html'), html)
// The same rows feed the Excel version (xlsx.py), so the two never drift apart.
writeFileSync(join(HERE, 'out/schedule.json'), JSON.stringify({ pages, breakthrough }, null, 1))
console.log(`wrote ${join(HERE, 'out/index.html')} — ${total} pages`)
