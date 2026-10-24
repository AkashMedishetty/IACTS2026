import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { conferenceConfig, getPlaceholderEmailDomain } from '@/config/conference.config'
import { generateRegistrationId } from '@/lib/utils/generateId'
import { getCheckInStaff, lastTenDigits, nameTokens, sharesName } from '@/lib/checkin'

export const dynamic = 'force-dynamic'

/*
 * Brings the onsite badge desk's export (registrations_<id>_<date>.xlsx) into
 * this database. Rows typed "onsite" are spot registrations: anyone not
 * already here is created with source "spot". Optionally, "Checked In = Yes"
 * from the desk is carried over to the matching records so the live count
 * starts from what the desk already scanned. dryRun=1 reports without writing.
 */

const TITLES: string[] = conferenceConfig.registration?.formFields?.titles || ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.']

// Desk category -> category key here. "-w" variants are the same category on the desk's workshop badge.
const CATEGORY_MAP: Record<string, string> = {
  'delegate': 'delegate', 'delegate-w': 'delegate',
  'faculty': 'faculty', 'faculty-w': 'faculty',
  'trade': 'trade', 'crew': 'crew',
  'conference manager': 'conference-manager',
  'organising-committee': 'organising-committee',
}
const DESIGNATION_FOR: Record<string, string> = {
  'faculty': 'Faculty', 'organising-committee': 'Organising Committee',
}
// Shared, made-up addresses the desk typed to get past its form.
const JUNK_EMAIL = /^(test|crew|trade|admin|spot|na|none|abc|xyz)@(gmail\.com|example\.com)$/i
const VALID_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type DeskRow = {
  deskId: string; title: string; firstName: string; lastName: string; email: string
  phone: string; city: string; country: string; category: string; type: string
  registeredAt: Date | null; checkedIn: boolean; mci: string; note: string; institution: string
}

function cellText(v: any): string {
  if (v == null) return ''
  if (typeof v === 'object') {
    if ('text' in v) return String(v.text).trim()
    if ('result' in v) return String(v.result ?? '').trim()
    if ('richText' in v) return v.richText.map((r: any) => r.text).join('').trim()
    if (v instanceof Date) return v.toISOString()
  }
  return String(v).trim()
}

/** "Dr." + "Sainaba V A", or "Dr. Jeevesh" + "K" -> title, first, last */
function splitName(first: string, last: string) {
  let title = ''
  let f = first.trim()
  let l = last.trim() === '.' ? '' : last.trim()
  const m = f.match(/^(dr|prof|mr|mrs|ms)\.?(\s+|$)/i)
  if (m) {
    title = TITLES.find((t) => t.toLowerCase().replace('.', '') === m[1].toLowerCase()) || ''
    f = f.slice(m[0].length).trim()
  }
  if (!f) { f = l; l = '' }
  return { title, firstName: f || 'Delegate', lastName: l }
}

function parseDeskDate(s: string): Date | null {
  // "10/23/2026, 3:40:53 AM" (the desk's locale, IST)
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i)
  if (!m) { const d = new Date(s); return isNaN(+d) ? null : d }
  let h = parseInt(m[4]) % 12
  if (m[7]?.toUpperCase() === 'PM') h += 12
  const iso = `${m[3]}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}T${String(h).padStart(2, '0')}:${m[5]}:${m[6]}+05:30`
  return new Date(iso)
}

async function readDeskFile(file: File): Promise<DeskRow[]> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(Buffer.from(await file.arrayBuffer()) as any)
  const sh = wb.worksheets[0]
  if (!sh) throw new Error('The file has no sheets')
  const header: Record<string, number> = {}
  sh.getRow(1).eachCell((c, i) => { header[cellText(c.value).toLowerCase()] = i })
  for (const need of ['registration id', 'first name', 'type']) {
    if (!header[need]) throw new Error(`Missing column "${need}" — is this the badge desk export?`)
  }
  const rows: DeskRow[] = []
  sh.eachRow((row, n) => {
    if (n === 1) return
    const get = (col: string) => (header[col] ? cellText(row.getCell(header[col]).value) : '')
    const deskId = get('registration id')
    if (!deskId) return
    const { title, firstName, lastName } = splitName(get('first name'), get('last name'))
    const note = Object.keys(header).filter((k) => k.startsWith('field_')).map(get).filter(Boolean).join('; ')
    rows.push({
      deskId, title, firstName, lastName,
      email: get('email').toLowerCase(),
      phone: get('phone'),
      city: get('city'), country: get('country') || 'India',
      category: get('category'), type: get('type').toLowerCase(),
      registeredAt: parseDeskDate(get('registered at')),
      checkedIn: /^(yes|true|1)$/i.test(get('checked in')),
      mci: get('mci number'), note, institution: get('organization'),
    })
  })
  return rows
}

export async function POST(request: NextRequest) {
  const staff = await getCheckInStaff()
  if (!staff || staff.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
  }

  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })
    const dryRun = form.get('dryRun') === '1'
    const syncCheckIns = form.get('syncCheckIns') === '1'
    const createAllUnmatched = form.get('createAllUnmatched') === '1'

    const rows = await readDeskFile(file)
    await connectDB()

    const existing: any[] = await User.find({})
      .select('email profile.firstName profile.lastName profile.phone registration.registrationId registration.remarks registration.checkIn role')
      .lean()
    const byEmail = new Map<string, any[]>()
    const byPhone = new Map<string, any[]>()
    const byRegId = new Map<string, any>()
    const byDeskId = new Map<string, any>()
    const push = (m: Map<string, any[]>, k: string, u: any) => { if (k) m.set(k, [...(m.get(k) || []), u]) }
    for (const u of existing) {
      u._tokens = nameTokens(u.profile?.firstName, u.profile?.lastName)
      push(byEmail, (u.email || '').toLowerCase(), u)
      push(byPhone, lastTenDigits(u.profile?.phone), u)
      if (u.registration?.registrationId) byRegId.set(u.registration.registrationId, u)
      const d = String(u.registration?.remarks || '').match(/desk ID ([\w-]+)/)
      if (d) byDeskId.set(d[1], u)
    }

    const findMatch = (r: DeskRow) => {
      const tokens = nameTokens(r.firstName, r.lastName)
      const prior = byDeskId.get(r.deskId)
      if (prior) return prior
      const sameId = byRegId.get(r.deskId)
      if (sameId && sharesName(tokens, sameId._tokens)) return sameId
      for (const u of byEmail.get(r.email) || []) if (sharesName(tokens, u._tokens)) return u
      for (const u of byPhone.get(lastTenDigits(r.phone)) || []) if (sharesName(tokens, u._tokens)) return u
      return null
    }

    const emailCount = new Map<string, number>()
    for (const r of rows) emailCount.set(r.email, (emailCount.get(r.email) || 0) + 1)

    const created: any[] = []
    const matchedSpot: any[] = []
    const unmatchedImported: any[] = []
    const checkInsToSync: { id: string; deskId: string; name: string }[] = []
    let alreadyCheckedIn = 0
    const takenIds = new Set(byRegId.keys())
    const errors: string[] = []

    for (const r of rows) {
      const name = [r.title, r.firstName, r.lastName].filter(Boolean).join(' ')
      const match = findMatch(r)

      if (match) {
        if (r.type === 'onsite') matchedSpot.push({ deskId: r.deskId, name, matchedTo: match.registration?.registrationId })
        if (r.checkedIn && match.role === 'user') {
          if (match.registration?.checkIn?.checkedIn) alreadyCheckedIn++
          else checkInsToSync.push({ id: String(match._id), deskId: r.deskId, name })
        }
        continue
      }

      if (r.type !== 'onsite' && !createAllUnmatched) {
        unmatchedImported.push({ deskId: r.deskId, name, email: r.email, category: r.category })
        continue
      }

      // New spot registration. Keep the desk's ID when it is free so the printed badge matches.
      let registrationId = r.deskId
      if (takenIds.has(registrationId)) {
        registrationId = await generateRegistrationId()
        while (takenIds.has(registrationId)) registrationId = await generateRegistrationId()
      }
      takenIds.add(registrationId)

      const emailUsable = VALID_EMAIL.test(r.email) && !JUNK_EMAIL.test(r.email) &&
        emailCount.get(r.email) === 1 && !byEmail.has(r.email)
      const email = emailUsable ? r.email : `spot-${registrationId.toLowerCase()}@${getPlaceholderEmailDomain()}`
      if (emailUsable) push(byEmail, email, { _tokens: nameTokens(r.firstName, r.lastName) })

      const type = CATEGORY_MAP[r.category.toLowerCase()] || r.category.toLowerCase().replace(/\s+/g, '-') || 'delegate'
      const remarks = [
        `Spot registration from onsite desk (desk ID ${r.deskId}, category ${r.category || '-'})`,
        r.note && `desk note: ${r.note}`,
        !emailUsable && r.email && `desk email: ${r.email}`,
      ].filter(Boolean).join('; ')

      const doc = {
        email,
        password: await bcrypt.hash(nanoid(24), 10),
        profile: {
          title: r.title || 'Dr.',
          firstName: r.firstName,
          lastName: r.lastName || '-',
          phone: r.phone || 'N/A',
          designation: DESIGNATION_FOR[type] || 'Other',
          institution: r.institution || '',
          mciNumber: r.mci && r.mci !== 'N/A' ? r.mci : '',
          address: { street: '', city: r.city, state: '', country: r.country, pincode: '' },
        },
        registration: {
          registrationId,
          type,
          status: 'confirmed',
          remarks,
          registrationDate: r.registeredAt || new Date(),
          confirmedDate: r.registeredAt || new Date(),
          workshopSelections: [],
          accompanyingPersons: [],
          source: 'spot',
          checkIn: r.checkedIn
            ? { checkedIn: true, checkedInAt: r.registeredAt || new Date(), checkedInBy: 'onsite-desk-import' }
            : { checkedIn: false },
        },
        role: 'user',
        isActive: true,
      }

      const summary = { deskId: r.deskId, registrationId, name, email, category: type, checkedIn: r.checkedIn }
      if (dryRun) { created.push(summary); continue }
      try {
        await User.create(doc)
        created.push(summary)
      } catch (e: any) {
        errors.push(`${r.deskId} ${name}: ${e?.message || 'failed'}`)
      }
    }

    let syncedCheckIns = 0
    if (syncCheckIns && !dryRun && checkInsToSync.length) {
      const res = await User.updateMany(
        { _id: { $in: checkInsToSync.map((c) => c.id) }, 'registration.checkIn.checkedIn': { $ne: true } },
        { $set: { 'registration.checkIn': { checkedIn: true, checkedInAt: new Date(), checkedInBy: 'onsite-desk-import' } } }
      )
      syncedCheckIns = res.modifiedCount
    }

    return NextResponse.json({
      success: true,
      dryRun,
      rows: rows.length,
      spotRows: rows.filter((r) => r.type === 'onsite').length,
      created,
      matchedSpot,
      unmatchedImported,
      checkIns: {
        toSync: checkInsToSync.length,
        synced: syncedCheckIns,
        alreadyCheckedIn,
        enabled: syncCheckIns,
      },
      errors,
    })
  } catch (error: any) {
    console.error('Spot import error:', error)
    return NextResponse.json({ success: false, message: error?.message || 'Import failed' }, { status: 500 })
  }
}
