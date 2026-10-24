import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { getCategoryLabel } from '@/config/conference.config'
import { ATTENDEE_QUERY, getCheckInStaff } from '@/lib/checkin'

export const dynamic = 'force-dynamic'

const IST = { timeZone: 'Asia/Kolkata' } as const

/** Attendance sheet. ?filter=checked-in | not-checked-in | all (default). */
export async function GET(request: NextRequest) {
  const staff = await getCheckInStaff()
  if (!staff) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const filter = new URL(request.url).searchParams.get('filter') || 'all'
    const query: any = { ...ATTENDEE_QUERY }
    if (filter === 'checked-in') query['registration.checkIn.checkedIn'] = true
    if (filter === 'not-checked-in') query['registration.checkIn.checkedIn'] = { $ne: true }

    await connectDB()
    const users = await User.find(query)
      .select('email profile registration')
      .sort({ 'registration.checkIn.checkedInAt': 1, 'profile.firstName': 1 })
      .lean()

    const wb = new ExcelJS.Workbook()
    const sh = wb.addWorksheet('Attendance')
    sh.columns = [
      { header: 'Registration ID', key: 'rid', width: 18 },
      { header: 'Title', key: 'title', width: 7 },
      { header: 'First Name', key: 'first', width: 22 },
      { header: 'Last Name', key: 'last', width: 22 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Institution', key: 'inst', width: 28 },
      { header: 'City', key: 'city', width: 14 },
      { header: 'Category', key: 'cat', width: 20 },
      { header: 'Registration Status', key: 'status', width: 14 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'MCI Number', key: 'mci', width: 18 },
      { header: 'Checked In', key: 'in', width: 11 },
      { header: 'Checked In At (IST)', key: 'at', width: 22 },
      { header: 'Checked In By', key: 'by', width: 26 },
    ]
    sh.getRow(1).font = { bold: true }
    sh.views = [{ state: 'frozen', ySplit: 1 }]

    for (const u of users as any[]) {
      const ci = u.registration?.checkIn
      sh.addRow({
        rid: u.registration?.registrationId || '',
        title: u.profile?.title || '',
        first: u.profile?.firstName || '',
        last: u.profile?.lastName === '-' ? '' : u.profile?.lastName || '',
        email: u.email || '',
        phone: u.profile?.phone || '',
        inst: u.profile?.institution || '',
        city: u.profile?.address?.city || '',
        cat: getCategoryLabel(u.registration?.type || ''),
        status: u.registration?.status || '',
        source: u.registration?.source || 'normal',
        mci: u.profile?.mciNumber || '',
        in: ci?.checkedIn ? 'Yes' : 'No',
        at: ci?.checkedIn && ci.checkedInAt ? new Date(ci.checkedInAt).toLocaleString('en-IN', IST) : '',
        by: ci?.checkedIn ? ci.checkedInBy || '' : '',
      })
    }
    sh.autoFilter = { from: 'A1', to: 'O1' }

    const buffer = await wb.xlsx.writeBuffer()
    const stamp = new Date().toLocaleString('sv-SE', IST).replace(/[: ]/g, '-').slice(0, 16)
    return new NextResponse(buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="attendance-${filter}-${stamp}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Check-in export error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
