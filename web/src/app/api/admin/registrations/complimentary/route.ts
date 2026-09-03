import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import ExcelJS from 'exceljs'
import archiver from 'archiver'
import { PassThrough } from 'stream'
import { generateRegistrationId } from '@/lib/utils/generateId'
import { QRCodeGenerator } from '@/lib/utils/qrcode-generator'
import { EmailService } from '@/lib/email/service'
import { getPlaceholderEmailDomain } from '@/config/conference.config'

export const maxDuration = 300

// Column auto-detection helpers
function norm(s: any) { return String(s ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') }
function pick(row: Record<string, any>, keys: string[]) {
  for (const k of Object.keys(row)) {
    if (keys.includes(norm(k))) { const v = row[k]; if (v != null && String(v).trim() !== '') return String(v).trim() }
  }
  return ''
}
function safe(s: string) { return s.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '-').slice(0, 40) || 'reg' }

function zipToBuffer(build: (a: archiver.Archiver) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const chunks: Buffer[] = []
    const pass = new PassThrough()
    pass.on('data', (c) => chunks.push(c as Buffer))
    pass.on('end', () => resolve(Buffer.concat(chunks)))
    archive.on('error', reject)
    archive.pipe(pass)
    build(archive)
    archive.finalize()
  })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const adminUser = await User.findById((session.user as any).id)
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })

    // Parse the uploaded Excel
    const wb = new ExcelJS.Workbook()
    await wb.xlsx.load(await file.arrayBuffer())
    const ws = wb.worksheets[0]
    if (!ws) return NextResponse.json({ success: false, message: 'No sheet found in the file' }, { status: 400 })

    // header row = first row with >=2 non-empty cells
    let headerRowIdx = 1
    for (let r = 1; r <= Math.min(ws.rowCount, 10); r++) {
      const cells = (ws.getRow(r).values as any[]).filter((v) => v != null && String(v).trim() !== '')
      if (cells.length >= 2) { headerRowIdx = r; break }
    }
    const headers: string[] = []
    ws.getRow(headerRowIdx).eachCell((cell, col) => { headers[col] = String(cell.value ?? '').trim() })

    const rows: Record<string, any>[] = []
    for (let r = headerRowIdx + 1; r <= ws.rowCount; r++) {
      const row = ws.getRow(r)
      const obj: Record<string, any> = {}
      let any = false
      row.eachCell((cell, col) => {
        const h = headers[col]; if (!h) return
        let v: any = cell.value
        if (v && typeof v === 'object' && 'text' in v) v = (v as any).text
        if (v && typeof v === 'object' && 'result' in v) v = (v as any).result
        obj[h] = v == null ? '' : String(v).trim()
        if (obj[h]) any = true
      })
      if (any) rows.push(obj)
    }

    if (rows.length === 0) return NextResponse.json({ success: false, message: 'No data rows found' }, { status: 400 })

    const NAME = ['name', 'fullname', 'delegatename', 'doctor', 'doctorname', 'nameoncertificate', 'nameoncert', 'certificatename']
    const FIRST = ['firstname', 'fname', 'first']
    const LAST = ['lastname', 'lname', 'last', 'surname']
    const EMAIL = ['email', 'emailid', 'emailaddress', 'mail']
    const PHONE = ['phone', 'mobile', 'mobileno', 'contact', 'contactno', 'phoneno', 'whatsapp', 'whatsappno']
    const DESIG = ['designation', 'category', 'type', 'registrationtype', 'role']
    const INST = ['institution', 'hospital', 'organisation', 'organization', 'affiliation']
    const CITY = ['city', 'town']
    const MEMBER = ['tsmcregno', 'tsmc', 'regno', 'registrationno', 'mciregno', 'mcino', 'mcinumber', 'membership', 'membershipnumber', 'membershipno', 'tasmno', 'lmno', 'mmcnumber']
    const REMARKS = ['remarks', 'remark', 'tag', 'source', 'notes', 'note', 'category']

    const defaultRemark = String(formData.get('remarks') || '').trim()

    const processed: any[] = []
    const errors: string[] = []
    let emailed = 0, noEmail = 0

    for (const row of rows) {
      try {
        let first = pick(row, FIRST), last = pick(row, LAST)
        if (!first && !last) {
          const full = pick(row, NAME)
          const parts = full.split(/\s+/)
          first = parts.shift() || 'Delegate'
          last = parts.join(' ')
        }
        const name = `${first} ${last}`.trim() || 'Delegate'
        const realEmail = pick(row, EMAIL).toLowerCase()
        const phone = pick(row, PHONE)
        const rawDesig = (pick(row, DESIG) || '').toLowerCase()
        const desig = /pg|student|post.?grad|resident/.test(rawDesig) ? 'PG/Student' : /fellow/.test(rawDesig) ? 'Fellow' : 'Consultant'
        const membership = pick(row, MEMBER)
        const rowRemark = pick(row, REMARKS) || defaultRemark

        // unique registration id (normal scheme)
        let registrationId = await generateRegistrationId()
        let attempts = 0
        while (attempts < 12 && await User.findOne({ 'registration.registrationId': registrationId })) {
          registrationId = await generateRegistrationId(); attempts++
        }

        const hasEmail = !!(realEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realEmail))
        const email = hasEmail ? realEmail : `comp-${registrationId.toLowerCase()}@${getPlaceholderEmailDomain()}`
        // Fake / internal emails (badge-only records, e.g. faculty & organizing team) — create + QR but DON'T actually email.
        const NOSEND = new RegExp(`@(${getPlaceholderEmailDomain().replace(/\./g, '\\.')}|noemail\\.[a-z0-9.-]+|placeholder\\.[a-z0-9.-]+)$`, 'i')
        const sendable = hasEmail && !NOSEND.test(email)

        if (hasEmail) {
          // De-dupe by email: skip anyone already in the system (registered / paid / already imported)
          const dup = await User.findOne({ email })
          if (dup) { errors.push(`${email} already exists — skipped`); continue }
        } else if (phone && phone.length >= 7) {
          // No-email rows can't be de-duped by email (placeholder is unique each run),
          // so de-dupe by phone among previously-imported no-email complimentary entries.
          const dup = await User.findOne({ 'profile.phone': phone, email: new RegExp(`@${getPlaceholderEmailDomain().replace(/\./g, '\\.')}$`, 'i') })
          if (dup) { errors.push(`${name} (${phone}) already imported — skipped`); continue }
        }

        await User.create({
          email,
          password: 'TempPass@' + registrationId,
          profile: {
            title: pick(row, ['title']) || 'Dr.',
            firstName: first || 'Delegate',
            lastName: last || '-',
            phone: phone || 'N/A',
            designation: desig,
            institution: pick(row, INST) || 'N/A',
            mciNumber: membership || 'N/A',
            address: { street: '', city: pick(row, CITY), state: '', country: 'India', pincode: '' },
          },
          registration: {
            registrationId,
            type: 'complimentary',
            status: 'confirmed',
            membershipNumber: membership || '',
            remarks: rowRemark || '',
            registrationDate: new Date(),
            paymentType: 'complimentary',
            workshopSelections: [],
            accompanyingPersons: [],
            source: 'admin-created',
          },
          role: 'user',
          isActive: true,
        })

        const qr = await QRCodeGenerator.generateRegistrationQRBuffer({ registrationId, name, email: hasEmail ? email : '', type: 'complimentary' })

        if (sendable) {
          await EmailService.sendRegistrationDetailsWithQR({ email, name, registrationId, registrationType: 'Complimentary' })
          emailed++
        } else {
          noEmail++
        }

        processed.push({ name, phone, email: sendable ? email : '', hasEmail: sendable, registrationId, qr, remarks: rowRemark, membership })
      } catch (e: any) {
        console.error('complimentary row error:', e?.message || e)
        errors.push(`Row error: ${e?.message || 'failed'}`)
      }
    }

    // Build the summary Excel (buffer), then zip it with the QR PNGs
    const out = new ExcelJS.Workbook()
    const sh = out.addWorksheet('Complimentary')
    sh.columns = [
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Phone / WhatsApp', key: 'phone', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Registration ID', key: 'rid', width: 18 },
      { header: 'Remarks', key: 'remarks', width: 22 },
      { header: 'Membership', key: 'membership', width: 18 },
      { header: 'Email Sent', key: 'sent', width: 22 },
      { header: 'QR File', key: 'qr', width: 34 },
    ]
    for (const p of processed) {
      sh.addRow({ name: p.name, phone: p.phone, email: p.email || '—', rid: p.registrationId, remarks: p.remarks || '', membership: p.membership || '', sent: p.hasEmail ? 'YES' : 'NO — send via WhatsApp', qr: `qr/${p.registrationId}_${safe(p.name)}.png` })
    }
    sh.getRow(1).font = { bold: true }
    const xlsxBuf = Buffer.from(await out.xlsx.writeBuffer())

    const finalZip = await zipToBuffer((archive) => {
      archive.append(xlsxBuf, { name: 'complimentary-registrations.xlsx' })
      for (const p of processed) {
        archive.append(p.qr, { name: `qr/${p.registrationId}_${safe(p.name)}.png` })
      }
    })

    return new NextResponse(finalZip as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="complimentary-registrations.zip"',
        'X-Total': String(processed.length),
        'X-Emailed': String(emailed),
        'X-No-Email': String(noEmail),
        'X-Errors': String(errors.length),
        'X-First-Error': encodeURIComponent(errors[0] || ''),
      },
    })
  } catch (error) {
    console.error('complimentary import error:', error)
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed' }, { status: 500 })
  }
}
