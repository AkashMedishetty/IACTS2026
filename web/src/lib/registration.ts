/**
 * Registration tier resolution.
 *
 * Everything here derives from `config/conference.config.ts` (tier windows) and
 * `config/pricing.config.ts` (amounts). Nothing about a specific conference —
 * dates, categories, prices, labels — is hardcoded in this file.
 */

import { conferenceConfig } from '@/config/conference.config'
import { pricingTiers } from '@/config/pricing.config'

export type RegistrationTierKey = 'earlyBird' | 'regular' | 'onsite'
export type RegistrationTier = string

const TIER_ORDER: RegistrationTierKey[] = ['earlyBird', 'regular', 'onsite']

function tierWindow(key: RegistrationTierKey) {
  return conferenceConfig.payment.tiers[key]
}

export function tierLabel(key: RegistrationTierKey): string {
  return tierWindow(key)?.label || pricingTiers[key]?.name || key
}

/** ISO day string, compared lexicographically against the config windows. */
function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getCurrentTierKey(date: Date = new Date()): RegistrationTierKey {
  const day = isoDay(date)
  const enabled = TIER_ORDER.filter((k) => tierWindow(k)?.enabled)

  for (const key of enabled) {
    const w = tierWindow(key)
    if (!w) continue
    if (w.startDate && day < w.startDate) continue
    if (w.endDate && day > w.endDate) continue
    return key
  }

  // Before the first window opens, quote the first tier; after the last window
  // closes, quote the last one.
  if (enabled.length === 0) return 'onsite'
  const first = enabled[0]
  const firstStart = tierWindow(first)?.startDate
  if (firstStart && day < firstStart) return first
  return enabled[enabled.length - 1]
}

export function getCurrentTier(date: Date = new Date()): RegistrationTier {
  return tierLabel(getCurrentTierKey(date))
}

export function getTierByDate(date: Date): RegistrationTier {
  return getCurrentTier(date)
}

export function tierKeyFromLabel(tier: RegistrationTier): RegistrationTierKey {
  const wanted = String(tier).trim().toLowerCase()
  const found = TIER_ORDER.find(
    (k) => tierLabel(k).toLowerCase() === wanted || pricingTiers[k]?.id === wanted || k === wanted,
  )
  return found || getCurrentTierKey()
}

export interface TierPricing {
  [category: string]: { amount: number; currency: string; label?: string }
}

export function getTierPricing(tier: RegistrationTier = getCurrentTier()): TierPricing {
  const key = tierKeyFromLabel(tier)
  const categories = pricingTiers[key]?.categories || {}
  const out: TierPricing = {}
  for (const [catKey, cat] of Object.entries(categories)) {
    out[catKey] = { amount: cat.amount, currency: cat.currency, label: cat.label }
  }
  return out
}

/**
 * The membership-bearing category key (e.g. "iacts-member"), taken from config
 * rather than assumed. Used where a representative member rate is needed.
 */
export function memberCategoryKey(): string {
  const withMembership = conferenceConfig.registration.categories.find((c) => c.requiresMembership)
  if (withMembership) return withMembership.key
  const first = conferenceConfig.registration.categories[0]
  return first?.key || ''
}

/** Base amount for a category in a tier; 0 when not configured. */
export function getCategoryAmount(categoryKey: string, tier: RegistrationTier = getCurrentTier()): number {
  return getTierPricing(tier)[categoryKey]?.amount ?? 0
}

export const registrationWindows = {
  earlyBirdEnd: tierWindow('earlyBird')?.endDate ? new Date(`${tierWindow('earlyBird')!.endDate}T23:59:59`) : null,
  regularStart: tierWindow('regular')?.startDate ? new Date(`${tierWindow('regular')!.startDate}T00:00:00`) : null,
  regularEnd: tierWindow('regular')?.endDate ? new Date(`${tierWindow('regular')!.endDate}T23:59:59`) : null,
  spotStart: tierWindow('onsite')?.startDate ? new Date(`${tierWindow('onsite')!.startDate}T00:00:00`) : null,
}

function formatWindow(key: RegistrationTierKey): string {
  const w = tierWindow(key)
  if (!w) return tierLabel(key)
  const fmt = (d?: string) => (d ? d.split('-').reverse().join('/') : '')
  if (w.startDate && w.endDate) return `${tierLabel(key)} ${fmt(w.startDate)}–${fmt(w.endDate)}`
  if (w.endDate) return `${tierLabel(key)} upto ${fmt(w.endDate)}`
  return tierLabel(key)
}

export const registrationLabels = {
  earlyBird: formatWindow('earlyBird'),
  regular: formatWindow('regular'),
  spot: formatWindow('onsite'),
}

export function getTierSummary(): string {
  return TIER_ORDER.filter((k) => tierWindow(k)?.enabled).map(formatWindow).join(' · ')
}
