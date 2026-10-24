import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

/** Check-in desk staff: admins and managers (operations). */
export const CHECKIN_ROLES = ['admin', 'manager']

export async function getCheckInStaff() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session?.user || !CHECKIN_ROLES.includes(role)) return null
  return { email: session.user.email || '', role: role as string }
}

/** Everyone who can walk through the door: delegates, not staff accounts,
 *  and not cancelled/refunded registrations. */
export const ATTENDEE_QUERY = {
  role: 'user',
  'registration.status': { $nin: ['cancelled', 'refunded'] },
}

export const ATTENDEE_FIELDS =
  'email profile.title profile.firstName profile.lastName profile.phone profile.institution profile.address.city ' +
  'registration.registrationId registration.type registration.status registration.source registration.checkIn'

const TITLE_RE = /^(dr|prof|mr|mrs|ms|miss)\.?$/i

/** Lower-case name words of 3+ letters, titles dropped — used to confirm two
 *  records with the same email/phone are actually the same person. */
export function nameTokens(...parts: (string | undefined)[]): Set<string> {
  return new Set(
    parts.join(' ').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
      .filter((t) => t.length >= 3 && !TITLE_RE.test(t))
  )
}

export function sharesName(a: Set<string>, b: Set<string>): boolean {
  for (const t of a) if (b.has(t)) return true
  return false
}

export function lastTenDigits(phone?: string): string {
  const d = String(phone || '').replace(/\D/g, '')
  return d.length >= 10 ? d.slice(-10) : ''
}
