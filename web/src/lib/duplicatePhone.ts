import User from '@/lib/models/User'

/**
 * One registration per mobile number.
 *
 * The email check alone let the same delegate register twice under two
 * addresses (g…@zohomail.com and g…@zohomail.in — same name, same phone), so
 * the phone is checked too. Matching is on the last 10 digits, because admin
 * imports may store "+91 98…" while the public form stores bare digits.
 *
 * Not counted as "taken":
 *  - the same email (a pending-payment delegate retrying the gateway),
 *  - cancelled or refunded registrations, and abandoned pending-payment ones,
 *  - staff accounts (admin, manager, reviewer, sponsor), which reuse the
 *    helpline number as a placeholder.
 */
export function phoneKey(raw: unknown): string | null {
  const digits = String(raw ?? '').replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : null
}

export async function findDelegateByPhone(rawPhone: unknown, excludeEmail?: string) {
  const key = phoneKey(rawPhone)
  if (!key) return null
  return User.findOne({
    role: 'user',
    'profile.phone': { $regex: `${key}$` }, // key is digits only, so safe as a pattern
    'registration.status': { $nin: ['cancelled', 'refunded', 'pending-payment'] },
    ...(excludeEmail ? { email: { $ne: excludeEmail.trim().toLowerCase() } } : {}),
  }).select('_id').lean()
}
