/**
 * Accommodation request handling.
 *
 * Delegates opt in with a checkbox and pick nights; the server never trusts
 * those values. Dates are clamped to the conference window from
 * conference.config.ts, nights are recomputed, and the room type must be one
 * the conference actually offers.
 */
import { conferenceConfig } from '@/config/conference.config'

const DAY_MS = 86_400_000
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/

export interface AccommodationInput {
  required?: boolean
  roomType?: string
  checkIn?: string
  checkOut?: string
}

export interface AccommodationRecord {
  required: boolean
  roomType?: string
  checkIn?: string
  checkOut?: string
  nights: number
  totalAmount: number
  complimentary?: boolean
}

/** True when the given pricing tier may request accommodation at all. */
export function accommodationAvailableFor(tierKey?: string): boolean {
  const cfg = conferenceConfig.accommodation
  if (!cfg?.enabled) return false
  if (cfg.availableForTiers?.length && !cfg.availableForTiers.includes(String(tierKey))) return false
  // A tier without a complete rate table is not offered accommodation, so a
  // missing rate can never quietly price a room at zero.
  const rates = cfg.ratesPerNight?.[String(tierKey)]
  return Boolean(rates) && cfg.roomTypes.every((r) => typeof rates[r] === 'number')
}

/** INR per night for this tier and room type, from the single rate table. */
export function accommodationRate(tierKey: string | undefined, roomType: string): number {
  const rate = conferenceConfig.accommodation.ratesPerNight?.[String(tierKey)]?.[roomType]
  if (typeof rate !== 'number') {
    throw new Error(`No accommodation rate for tier "${tierKey}", room "${roomType}"`)
  }
  return rate
}

export const accommodationWindow = () => ({
  from: conferenceConfig.accommodation.checkInFrom,
  to: conferenceConfig.accommodation.checkOutBy,
})

function clampDay(value: string | undefined, min: string, max: string): string | null {
  if (!value) return null
  const day = String(value).slice(0, 10)
  if (!ISO_DAY.test(day)) return null
  if (day < min) return min
  if (day > max) return max
  return day
}

/**
 * @param tierKey current pricing tier ('earlyBird' | 'regular' | 'onsite') —
 *        used to mark complimentary stays.
 */
export function sanitizeAccommodation(
  input: AccommodationInput | undefined | null,
  opts: { tierKey?: string } = {},
): AccommodationRecord {
  const cfg = conferenceConfig.accommodation
  const none: AccommodationRecord = { required: false, nights: 0, totalAmount: 0 }

  if (!accommodationAvailableFor(opts.tierKey) || !input?.required) return none

  const { from, to } = accommodationWindow()
  const checkIn = clampDay(input.checkIn, from, to) ?? from
  let checkOut = clampDay(input.checkOut, from, to) ?? to
  if (checkOut < checkIn) checkOut = checkIn

  const nights = Math.max(
    0,
    Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / DAY_MS),
  )

  const roomType = cfg.roomTypes.includes(String(input.roomType))
    ? String(input.roomType)
    : cfg.defaultRoomType

  // Priced from the rate table for the delegate's tier — never from the client.
  const perNight = accommodationRate(opts.tierKey, roomType)
  const totalAmount = perNight * nights
  const complimentary = perNight === 0 && cfg.complimentaryForTiers.includes(String(opts.tierKey))

  return { required: true, roomType, checkIn, checkOut, nights, totalAmount, complimentary }
}
