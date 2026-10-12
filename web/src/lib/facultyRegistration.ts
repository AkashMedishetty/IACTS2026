import { timingSafeEqual } from 'crypto'
import { conferenceConfig } from '@/config/conference.config'

/**
 * Faculty registration link.
 *
 * Faculty register on the SAME form as delegates but pay nothing, so the
 * category they use ("complimentary") is worth money to anyone who can name
 * it. The registration API accepts a category from the request body, so
 * without a gate any delegate could post "complimentary" and register free.
 * The faculty link therefore carries a secret key, checked here and on the
 * server for every complimentary or sponsored registration.
 *
 * Set FACULTY_REGISTRATION_KEY in the environment. If it is unset, faculty
 * registration is closed and free categories are refused — a missing secret
 * must never mean "let everyone in".
 */
export const FACULTY_CATEGORY_KEY = 'complimentary'

/** Admin-only categories (complimentary, sponsored, faculty, special invitee,
 *  delegate) have no public price, so the public API refuses them unless the
 *  request carries the faculty key. Derived from config so a new admin-only
 *  category is gated the moment it is added. */
export const GATED_FREE_CATEGORIES = conferenceConfig.registration.categories
  .filter((c) => c.adminOnly)
  .map((c) => c.key)

export function facultyRegistrationKey(): string | null {
  const key = process.env.FACULTY_REGISTRATION_KEY?.trim()
  return key ? key : null
}

export function isValidFacultyKey(candidate: unknown): boolean {
  const expected = facultyRegistrationKey()
  if (!expected || typeof candidate !== 'string') return false
  const a = Buffer.from(candidate.trim())
  const b = Buffer.from(expected)
  // Compare in constant time, but only when lengths match — timingSafeEqual
  // throws otherwise.
  return a.length === b.length && timingSafeEqual(a, b)
}
