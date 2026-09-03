/**
 * Single source for abstract subspecialties and their topics.
 *
 * Everything derives from conferenceConfig.abstracts.specialties, so no
 * conference-specific taxonomy is ever hardcoded in a page or a component.
 */
import { conferenceConfig } from '@/config/conference.config'

export const SPECIALTIES = conferenceConfig.abstracts.specialties.filter((s) => s.enabled)

export const SPECIALTY_OPTIONS = SPECIALTIES.map(({ key, label }) => ({ key, label, enabled: true }))

export const TOPICS_BY_SPECIALTY: Record<string, string[]> = Object.fromEntries(
  SPECIALTIES.map((s) => [s.key, [...s.topics]]),
)

export function topicsForSpecialty(key?: string): string[] {
  if (!key) return []
  return TOPICS_BY_SPECIALTY[key] ?? []
}

export const DEFAULT_SPECIALTY_KEY = SPECIALTIES[0]?.key ?? ''

/** Human label for a specialty key, falling back to the key itself. */
export function specialtyLabel(key?: string): string {
  if (!key) return ''
  return SPECIALTIES.find((s) => s.key === key)?.label ?? key
}
