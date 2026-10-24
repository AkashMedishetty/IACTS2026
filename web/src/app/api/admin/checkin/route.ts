import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { ATTENDEE_FIELDS, ATTENDEE_QUERY, getCheckInStaff } from '@/lib/checkin'

export const dynamic = 'force-dynamic'

/** Full attendee list + live counts. The desk polls this every few seconds;
 *  a few hundred lean rows is cheap, and searching client-side keeps typing instant. */
export async function GET() {
  const staff = await getCheckInStaff()
  if (!staff) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    await connectDB()
    const users = await User.find(ATTENDEE_QUERY).select(ATTENDEE_FIELDS)
      .sort({ 'profile.firstName': 1 }).lean()

    const attendees = users.map((u: any) => ({
      id: String(u._id),
      registrationId: u.registration?.registrationId || '',
      name: [u.profile?.title, u.profile?.firstName, u.profile?.lastName]
        .filter((p: string) => p && p !== '-').join(' '),
      email: u.email || '',
      phone: u.profile?.phone || '',
      institution: u.profile?.institution || '',
      city: u.profile?.address?.city || '',
      type: u.registration?.type || '',
      status: u.registration?.status || '',
      source: u.registration?.source || 'normal',
      checkedIn: !!u.registration?.checkIn?.checkedIn,
      checkedInAt: u.registration?.checkIn?.checkedInAt || null,
      checkedInBy: u.registration?.checkIn?.checkedInBy || '',
    }))

    const byType: Record<string, { total: number; checkedIn: number }> = {}
    for (const a of attendees) {
      const t = (byType[a.type] ||= { total: 0, checkedIn: 0 })
      t.total++
      if (a.checkedIn) t.checkedIn++
    }

    return NextResponse.json({
      success: true,
      attendees,
      stats: {
        total: attendees.length,
        checkedIn: attendees.filter((a) => a.checkedIn).length,
        byType,
      },
      serverTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Check-in list error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

/** Mark (or undo) entry for one attendee. */
export async function POST(request: NextRequest) {
  const staff = await getCheckInStaff()
  if (!staff) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  try {
    const { id, checkedIn } = await request.json()
    if (!id || typeof checkedIn !== 'boolean') {
      return NextResponse.json({ success: false, message: 'id and checkedIn are required' }, { status: 400 })
    }

    await connectDB()
    const update = checkedIn
      ? { 'registration.checkIn': { checkedIn: true, checkedInAt: new Date(), checkedInBy: staff.email } }
      : { 'registration.checkIn': { checkedIn: false } }

    // Marking someone already in keeps the original entry time.
    const filter: any = { _id: id, ...ATTENDEE_QUERY }
    if (checkedIn) filter['registration.checkIn.checkedIn'] = { $ne: true }

    const res = await User.updateOne(filter, { $set: update })
    const user: any = await User.findOne({ _id: id }).select('registration.checkIn').lean()
    if (!user) return NextResponse.json({ success: false, message: 'Attendee not found' }, { status: 404 })

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: checkedIn && res.modifiedCount === 0,
      checkIn: user.registration?.checkIn || { checkedIn: false },
    })
  } catch (error) {
    console.error('Check-in update error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
