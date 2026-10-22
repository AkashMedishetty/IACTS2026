/**
 * Shared look of the printable schedules (scientific schedule, workshop):
 * the committee's table — bordered cells, Arial, centred headings and topics —
 * in the event palette, built for printing (white paper, 10 mm margins, light fills).
 */
export const LOGO = '../../../public/brand/iacts-technocollege-2026-logo.png'
export const FONTS = '../../trade-brochure/assets/base.css'

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const names = (n) => (Array.isArray(n) ? n.map(esc).join('<br>') : esc(n))

export function row(r) {
  switch (r.k) {
    case 'session':
      return `<tr class="ses"><td colspan="4"><div class="st">${esc(r.title)}</div>${r.chairs ? `<div class="ch">Chairpersons - ${esc(r.chairs)}</div>` : ''}</td></tr>`
    case 'talk':
      return `<tr class="talk"><td class="tm">${esc(r.time)}</td><td class="no">${r.n}</td><td class="nm">${names(r.name)}</td>
        <td class="tp">${r.badge ? `<b>${esc(r.badge)}:</b> ` : ''}${esc(r.topic)}</td></tr>`
    case 'break':
      return `<tr class="brk"><td class="tm b">${esc(r.time)}</td><td></td><td colspan="2">${esc(r.label)}</td></tr>`
    case 'ceremony':
      return `<tr class="cer"><td class="tm b">${esc(r.time)}</td><td></td><td></td>
        <td class="tp"><div class="lbl">${esc(r.title)}</div><div class="gs">${r.guests.map((g) => `<div class="g">${esc(g)}</div>`).join('')}</div></td></tr>`
    case 'panel':
      return `<tr class="pan"><td class="tm b">${esc(r.time)}</td><td class="no">${r.n ?? ''}</td>
        <td class="nm">${r.moderator ? `Moderator - ${esc(r.moderator)}` : 'PANEL DISCUSSION'}</td>
        <td class="tp"><div class="lbl">${r.moderator ? 'PANEL DISCUSSION - ' : ''}${esc(r.topic)}</div><div>Panelists - ${esc(r.panelists)}</div></td></tr>`
    case 'special':
      return `<tr class="brk"><td class="tm b">${esc(r.time)}</td><td></td><td colspan="2">${esc(r.label)}</td></tr>
        <tr class="talk"><td class="tm"></td><td class="no">${r.n}</td><td class="nm">${names(r.name)}</td><td class="tp">${esc(r.topic)}</td></tr>`
    case 'gala':
      return `<tr class="gala"><td class="tm b">${esc(r.time)}</td><td></td><td colspan="2">${esc(r.label)}</td></tr>`
  }
}

export const top = `
  <div class="hd"><img src="${LOGO}" alt="IACTS TechnoCollege CME 2026">
    <div class="hd-r">THE FUTURE <span>IS NOW</span><small>23 – 25 October 2026 · Hyderabad</small></div></div>`

/** Footer; the page count is left out of a one-page document. */
export const foot = (n, total) => `<div class="ft">IACTS TechnoCollege CME 2026 &nbsp;|&nbsp; iactstechnocollegecme2026.com${total > 1 ? ` &nbsp;|&nbsp; Page ${n} of ${total}` : ''}</div>`

/** Wrap pages into a printable document. */
export const document = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<link rel="stylesheet" href="${FONTS}"><style>${css}</style></head><body>${body}</body></html>`

export const css = `
@page{size:297mm 210mm;margin:0}
.page.sp{width:297mm;height:210mm;background:#fff;position:relative;overflow:hidden}
.sp .pad{position:absolute;top:10mm;left:10mm;right:10mm;bottom:10mm;display:flex;flex-direction:column}
.sp,.sp table{font-family:Arial,Helvetica,sans-serif;color:#17120F}
.hd{display:flex;align-items:center;justify-content:space-between;padding-bottom:2.5mm;border-bottom:.8mm solid #B3122A;margin-bottom:.6mm}
.hd img{height:16mm;display:block}
.hd-r{text-align:right;font-family:'Anton';font-size:19pt;letter-spacing:.06em;color:#B3122A;line-height:1}
.hd-r span{color:#A9793A}
.hd-r small{display:block;font-family:Arial,sans-serif;font-size:8pt;letter-spacing:.12em;color:#6A545A;text-transform:uppercase;margin-top:1.4mm;font-weight:bold}
.hd+table{border-top:.4mm solid #A9793A;margin-top:.6mm}
table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10.2pt;margin-top:3mm}
td,th{border:.25mm solid #D9C29C;padding:2.05mm 2.2mm;vertical-align:middle}
tr.colh th{background:#8B0000;color:#fff;font-weight:bold;font-size:10pt;text-align:center}
tr.title td{background:#B3122A;color:#fff;font-weight:bold;font-size:14pt;text-align:center;padding:2mm}
tr.info td{background:#F6EBDA;color:#5F0717;font-weight:bold;font-size:11.5pt;text-align:center}
tr.ses td{background:#F8E9ED;text-align:center;padding:2mm 2mm}
tr.ses .st{color:#B3122A;font-weight:bold;font-size:12pt}
tr.ses .ch{color:#17120F;font-size:10pt;margin-top:.6mm}
tr.talk:nth-child(odd) td{background:#FFFCF7}
td.tm{font-size:9.8pt;white-space:nowrap}
td.b,.b{font-weight:bold}
td.no{text-align:center}
td.nm{font-weight:bold}
td.tp{text-align:center}
tr.brk td{background:#EAD8B8;font-weight:bold}
tr.brk td:last-child{text-align:center;color:#5F0717;font-size:11pt;letter-spacing:.06em}
tr.cer td{background:#F8E9ED}
tr.cer .lbl{color:#B3122A;font-weight:bold;margin-bottom:.6mm}
tr.cer .gs{display:grid;grid-template-columns:repeat(3,1fr);gap:.4mm 3mm}
tr.cer .g{font-weight:bold;font-size:9.8pt;line-height:1.3}
tr.pan td{background:#F8E9ED}
tr.pan td.nm{font-weight:bold}
tr.pan td.tp{font-size:9.6pt}
tr.pan .lbl{font-weight:bold;color:#B3122A;margin-bottom:.4mm}
tr.gala td{background:#EAD8B8;font-weight:bold}
tr.gala td:last-child{text-align:center;color:#B3122A;font-size:11.5pt;letter-spacing:.08em}
.bt{font-size:11.5pt;width:78%;margin:6mm auto 0}
.bt td{padding:3.2mm 2mm}
/* Workshop: two halls side by side, as in the committee's sheet */
.ws2{font-size:10.6pt;margin-top:4mm}
.ws2 td,.ws2 th{padding:2.6mm 2mm}
.ws2 td.gap{border:0;background:#fff;padding:0}
.ws2 tr.hall td{background:#F8E9ED;color:#B3122A;font-weight:bold;font-size:12.5pt;text-align:center;letter-spacing:.06em}
.ws2 tr.hall td.gap{background:#fff}
.ws2 tr.colh td.gap{background:#fff}
.ws2 td{background:#fff}
.ws2 td.alt{background:#FFFCF7}
.ws2 td.tm{white-space:nowrap;text-align:center;font-size:9.6pt}
.ws2 th{white-space:nowrap}
.ws2 td.tm.wrap{white-space:normal}
.ws2 td.nm{font-size:9.8pt;line-height:1.3;white-space:nowrap}
.ws2 td.lu{background:#EAD8B8;font-weight:bold}
.ws2 td.lu.lbl{text-align:center;color:#5F0717;letter-spacing:.06em;font-size:11pt}
.ft{margin-top:auto;text-align:center;font-size:7.6pt;color:#6A545A;border-top:.25mm solid #D9C29C;padding-top:1.6mm}
`
