import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { EmailService } from '@/lib/email/service'
import { getPlaceholderEmailDomain } from '@/config/conference.config'

export const maxDuration = 300

// Placeholder-email pattern used for no-email complimentary entries
const PLACEHOLDER = new RegExp(`@${getPlaceholderEmailDomain().replace(/\./g, '\\.')}$`, 'i')

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !(session.user as any).id) return { error: 'Unauthorized', status: 401 }
  await connectDB()
  const adminUser = await User.findById((session.user as any).id)
  if (!adminUser || adminUser.role !== 'admin') return { error: 'Admin access required', status: 403 }
  return { ok: true }
}

// Find the complimentary batch that has a real (sendable) email
async function findTargets() {
  return User.find({
    'registration.type': 'complimentary',
    'registration.source': 'admin-created',
    email: { $not: PLACEHOLDER },
  })
    .select('email profile registration')
    .sort({ 'registration.registrationId': 1 })
    .lean()
}

// GET = preview who would be emailed (no send)
export async function GET() {
  const auth = await requireAdmin()
  if ((auth as any).error) return NextResponse.json({ success: false, message: (auth as any).error }, { status: (auth as any).status })

  const targets = await findTargets()
  return NextResponse.json({
    success: true,
    count: targets.length,
    recipients: targets.map((u: any) => ({
      registrationId: u.registration?.registrationId,
      name: `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.trim(),
      email: u.email,
      remarks: u.registration?.remarks || '',
    })),
  })
}

// POST = actually re-send the registration details + QR (with corrected APP_URL links)
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ((auth as any).error) return NextResponse.json({ success: false, message: (auth as any).error }, { status: (auth as any).status })

  // Parse request body once
  const body = await request.json().catch(() => null)

  // Optional: restrict to a specific list of registration IDs
  let onlyIds: string[] | null = null
  if (body && Array.isArray(body.registrationIds) && body.registrationIds.length > 0) {
    onlyIds = body.registrationIds.map((s: any) => String(s).trim())
  }

  // Resume position for chunked sending (client passes nextIndex on subsequent calls)
  let startIndex = 0
  if (body && Number.isFinite(body.startIndex)) startIndex = Math.max(0, Number(body.startIndex))

  let targets = await findTargets()
  if (onlyIds) targets = targets.filter((u: any) => onlyIds!.includes(u.registration?.registrationId))

  // Time budget so we finish before Vercel's 300s hard limit and let the client resume
  const TIME_BUDGET_MS = 230 * 1000
  const startedAt = Date.now()

  let sent = 0
  const failed: Array<{ registrationId: string; email: string; error: string }> = []
  let index = startIndex

  while (index < targets.length) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) break
    const u: any = targets[index]
    const name = `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.trim() || 'Delegate'
    const registrationId = u.registration?.registrationId
    try {
      const res = await EmailService.sendRegistrationDetailsWithQR({
        userId: String(u._id),
        email: u.email,
        name,
        registrationId,
        registrationType: 'Complimentary',
      })
      if ((res as any)?.success === false) throw new Error((res as any)?.error || 'send failed')
      sent++
    } catch (e: any) {
      failed.push({ registrationId, email: u.email, error: e?.message || 'failed' })
    }
    index++
  }

  const done = index >= targets.length

  return NextResponse.json({
    success: true,
    total: targets.length,
    sent,
    failed: failed.length,
    failures: failed.length ? failed : undefined,
    processedUpTo: index,
    nextIndex: done ? null : index,
    done,
    message: done
      ? `Re-sent ${sent} of ${targets.length} complimentary emails${failed.length ? ` (${failed.length} failed)` : ''}`
      : `Sent ${sent} so far — resuming from ${index} of ${targets.length}`,
  })
}
