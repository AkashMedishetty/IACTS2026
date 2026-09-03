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

  if (!cfg?.enabled || !input?.required) return none

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

  const complimentary = Boolean(
    opts.tierKey &&
      cfg.complimentaryForTiers.includes(opts.tierKey) &&
      roomType === cfg.complimentaryRoomType,
  )

  // No paid accommodation rate has been published, so the charge stays 0 and
  // is never taken from the client. Admin can adjust per booking.
  return { required: true, roomType, checkIn, checkOut, nights, totalAmount: 0, complimentary }
}
