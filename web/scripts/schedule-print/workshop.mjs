/**
 * The pre-conference workshop day (23 October 2026) on one printable A4 page,
 * laid out like the committee's sheet (Workshop_Breakthrough_Final, 22 October
 * 2026): Hall A and Hall B side by side, each S.No · Topic · Faculty · Timings,
 * rows lined up across the halls — in the scientific schedule's colours.
 *
 *   node scripts/schedule-print/workshop.mjs
 *   node scripts/schedule-print/render.mjs "<output.pdf>" out/workshop.html
 *   python scripts/schedule-print/xlsx.py "<output.xlsx>" workshop
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { esc, top, foot, document } from './shared.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))

const W = {
  title: 'Workshop - 23rd October 2026',
  date: 'Friday, 23 October 2026',
  venue: 'Nizam’s Institute of Medical Sciences, Panjagutta, Hyderabad',
  halls: ['Hall A', 'Hall B'],
  // One entry per sheet row: [Hall A cell, Hall B cell], exactly as the sheet pairs them.
  rows: [
    [{ n: 1, topic: 'Applied Anatomy of Heart', faculty: ['Dr. Anil Tendolkar'], time: '9.00 am – 1.00 pm' },
     { lunch: true, time: '1.00 – 2.00 pm' }],
    [{ lunch: true, time: '1.00 – 2.00 pm' },
     { n: 1, topic: 'Sizing and Planning for FET - Aortic Aneurysm and Dissection', faculty: ['Dr. Niranjan Hiremath'], time: '2.00 – 2.30 pm' }],
    [{ n: 2, topic: 'Coronary Anastomosis', faculty: ['Dr. P S S Gopal', 'Dr. B Kaladhar'], time: '2.00 – 4.00 pm' },
     { n: 2, topic: 'Deployment of FET', faculty: ['Dr. Niranjan Hiremath'], time: '2.30 – 3.30 pm' }],
    [{ n: 3, topic: 'Proximal Coronary Anastomosis Contest', faculty: ['Dr. Abhijeet M Dashetwar', 'Dr. Vinayak Shukla'], time: '4.00 – 5.00 pm' },
     { n: 3, topic: 'MICS CABG Planning & Demo Workshop Simulator',
       faculty: ['Dr. Naresh K L', 'Dr. Vishal Khante', 'Dr. Nagesh Ayalasomayajula', 'Dr. Harish Badami'], time: '3.30 – 5.00 pm' }],
    [{ n: 4, topic: 'Stapler Devices - Hands On', faculty: ['Dr. P Sai Surabhi', 'Dr. D Praveen'], time: 'Parallel with Workshop\n2.00 – 4.00 pm' },
     null],
  ],
}

const cell = (c, alt) => {
  if (!c) return `<td class="no ${alt}"></td><td class="${alt}"></td><td class="${alt}"></td><td class="${alt}"></td>`
  if (c.lunch) return `<td class="lu"></td><td class="lu lbl" colspan="2">Lunch</td><td class="lu tm b">${esc(c.time)}</td>`
  return `<td class="no ${alt}">${c.n}</td><td class="tp ${alt}">${esc(c.topic)}</td>
    <td class="nm ${alt}">${c.faculty.map(esc).join('<br>')}</td><td class="tm ${alt}${c.time.includes('\n') ? ' wrap' : ''}">${esc(c.time).replace('\n', '<br>')}</td>`
}

const body = `
<section class="page sp"><div class="pad">${top}
  <table class="ws2"><colgroup>
    <col style="width:4.5%"><col style="width:14%"><col style="width:18.5%"><col style="width:12%">
    <col style="width:2%">
    <col style="width:4.5%"><col style="width:14%"><col style="width:18.5%"><col style="width:12%">
  </colgroup><tbody>
    <tr class="title"><td colspan="9">${esc(W.title)}</td></tr>
    <tr class="info"><td colspan="9">Venue : ${esc(W.venue)}</td></tr>
    <tr class="info"><td colspan="9">${esc(W.date)}</td></tr>
    <tr class="hall"><td colspan="4">${W.halls[0]}</td><td class="gap"></td><td colspan="4">${W.halls[1]}</td></tr>
    <tr class="colh"><th>S.No.</th><th>Topic</th><th>Faculty</th><th>Timings</th><td class="gap"></td>
      <th>S.No.</th><th>Topic</th><th>Faculty</th><th>Timings</th></tr>
    ${W.rows.map(([a, b], i) => `<tr>${cell(a, i % 2 ? 'alt' : '')}<td class="gap"></td>${cell(b, i % 2 ? 'alt' : '')}</tr>`).join('')}
  </tbody></table>
  ${foot(1, 1)}</div>
</section>`

mkdirSync(join(HERE, 'out'), { recursive: true })
writeFileSync(join(HERE, 'out/workshop.html'), document('Workshop — IACTS TechnoCollege CME 2026', body))
// Same rows for the Excel version (xlsx.py).
writeFileSync(join(HERE, 'out/workshop.json'), JSON.stringify(W, null, 1))
console.log(`wrote ${join(HERE, 'out/workshop.html')}`)
