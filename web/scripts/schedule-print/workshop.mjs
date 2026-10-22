/**
 * The pre-conference workshop day (23 October 2026) on one printable A4 page,
 * in the same table and colours as the scientific schedule (build.mjs).
 *
 *   node scripts/schedule-print/workshop.mjs
 *   node scripts/schedule-print/render.mjs "<output.pdf>" out/workshop.html
 *
 * From the committee's sheet (Workshop_Breakthrough_Final, 22 October 2026):
 * same sessions, faculty and timings; Hall A and Hall B one after the other.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { esc, row, top, foot, document } from './shared.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))

const day = {
  title: 'Pre-Conference Workshop', date: 'Friday, 23 October 2026',
  venue: 'Nizam’s Institute of Medical Sciences, Panjagutta, Hyderabad',
}
const T = (time, n, name, topic) => ({ k: 'talk', time, n, name, topic })
const HALL = (title) => ({ k: 'session', title })
const LUNCH = { k: 'break', time: '1.00 – 2.00 pm', label: 'Lunch' }

const rows = [
  HALL('Hall A'),
  T('9.00 am – 1.00 pm', 1, 'Dr. Anil Tendolkar', 'Applied Anatomy of Heart'),
  LUNCH,
  T('2.00 – 4.00 pm', 2, ['Dr. P S S Gopal', 'Dr. B Kaladhar'], 'Coronary Anastomosis'),
  T('4.00 – 5.00 pm', 3, ['Dr. Abhijeet M Dashetwar', 'Dr. Vinayak Shukla'], 'Proximal Coronary Anastomosis Contest'),
  T('2.00 – 4.00 pm', 4, ['Dr. P Sai Surabhi', 'Dr. D Praveen'], 'Stapler Devices - Hands On (parallel with the workshop)'),
  HALL('Hall B'),
  LUNCH,
  T('2.00 – 2.30 pm', 1, 'Dr. Niranjan Hiremath', 'Sizing and Planning for FET - Aortic Aneurysm and Dissection'),
  T('2.30 – 3.30 pm', 2, 'Dr. Niranjan Hiremath', 'Deployment of FET'),
  T('3.30 – 5.00 pm', 3, ['Dr. Naresh K L', 'Dr. Vishal Khante', 'Dr. Nagesh Ayalasomayajula', 'Dr. Harish Badami'],
    'MICS CABG Planning & Demo Workshop Simulator'),
]

const body = `
<section class="page sp"><div class="pad">${top}
  <table class="ws"><colgroup><col style="width:15%"><col style="width:6%"><col style="width:25%"><col></colgroup><tbody>
    <tr class="colh"><th>Timings</th><th>S. No.</th><th>Faculty</th><th>Workshop Topic</th></tr>
    <tr class="title"><td colspan="4">WORKSHOP</td></tr>
    <tr class="info"><td colspan="4">${day.title} - ${day.date}</td></tr>
    <tr class="info"><td colspan="4">Venue : ${esc(day.venue)}</td></tr>
    ${rows.map(row).join('')}
  </tbody></table>
  ${foot(1, 1)}</div>
</section>`

mkdirSync(join(HERE, 'out'), { recursive: true })
writeFileSync(join(HERE, 'out/workshop.html'), document('Workshop — IACTS TechnoCollege CME 2026', body))
// Same rows for the Excel version (xlsx.py), in the shape schedule.json uses.
writeFileSync(join(HERE, 'out/workshop.json'), JSON.stringify({ title: 'WORKSHOP', pages: [{ day, rows }], breakthrough: [] }, null, 1))
console.log(`wrote ${join(HERE, 'out/workshop.html')}`)
