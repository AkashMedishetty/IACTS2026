import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { EmailService } from '@/lib/email/service'

// Bulk re-send registration details (ID + QR + brochure + WhatsApp + event info)
// to every confirmed registrant. Admin only.
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

    const body = await request.json().catch(() => ({}))
    const dryRun: boolean = !!body.dryRun
    const testEmail: string | undefined = body.testEmail?.trim()

    // All confirmed / paid registrants
    const query: any = {
      'registration.registrationId': { $exists: true, $ne: null, $nin: ['', 'N/A'] },
      'registration.status': { $in: ['confirmed', 'paid'] },
    }

    let recipients = await User.find(query)
      .select('email profile.firstName profile.lastName registration.registrationId registration.type')
      .lean()

    if (testEmail) {
      recipients = recipients.filter((u: any) => u.email?.toLowerCase() === testEmail.toLowerCase())
      if (recipients.length === 0) {
        // Allow sending a test even if the email isn't a confirmed registrant
        const u: any = await User.findOne({ email: testEmail }).select('email profile registration').lean()
        if (u) recipients = [u]
      }
    }

    const total = recipients.length

    if (dryRun) {
      return NextResponse.json({ success: true, dryRun: true, total, message: `${total} registrant(s) will receive the email.` })
    }

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const u of recipients as any[]) {
      const name = `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.trim() || 'Delegate'
      try {
        const res = await EmailService.sendRegistrationDetailsWithQR({
          userId: u._id?.toString(),
          email: u.email,
          name,
          registrationId: u.registration?.registrationId || 'N/A',
          registrationType: u.registration?.type || '',
        })
        if (res && (res as any).success !== false) sent++
        else { failed++; if (errors.length < 10) errors.push(`${u.email}: ${(res as any)?.error || 'failed'}`) }
      } catch (e: any) {
        failed++
        if (errors.length < 10) errors.push(`${u.email}: ${e?.message || 'error'}`)
      }
      // gentle pacing to avoid SMTP rate limits
      await new Promise((r) => setTimeout(r, 120))
    }

    return NextResponse.json({
      success: true,
      total,
      sent,
      failed,
      testEmail: testEmail || undefined,
      errors: errors.length ? errors : undefined,
      message: `Sent ${sent}/${total}${failed ? `, ${failed} failed` : ''}.`,
    })
  } catch (error) {
    console.error('resend-details error:', error)
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Failed to resend' }, { status: 500 })
  }
}
