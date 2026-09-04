/**
 * One validation contract for delegate registration, imported by BOTH the
 * form and the API route. The client copy gives immediate feedback; the server
 * copy is the one that actually decides, since a browser can send anything.
 */
import { conferenceConfig } from '@/config/conference.config'

export interface RegistrationInput {
  email?: string
  password?: string
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    designation?: string
    institution?: string
    mciNumber?: string
    address?: { pincode?: string }
  }
  registration?: { type?: string; membershipNumber?: string }
  payment?: { method?: string; bankTransferUTR?: string; screenshotUrl?: string }
}

/** Indian mobile: 10 digits starting 6-9, tolerant of +91, spaces and dashes. */
export const PHONE_RE = /^[6-9]\d{9}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
/** Letters, spaces, hyphens, apostrophes and full stops — no digits. */
export const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,59}$/
/** Council registration numbers vary by state; allow alphanumerics with / and -. */
export const MCI_RE = /^[A-Za-z0-9][A-Za-z0-9/\-. ]{3,29}$/
export const UTR_RE = /^[A-Za-z0-9]{6,30}$/
export const PINCODE_RE = /^[1-9]\d{5}$/

export const normalisePhone = (raw: string) => String(raw).replace(/\D/g, '').slice(-10)

export function validateRegistration(input: RegistrationInput): string[] {
  const e: string[] = []
  const p = input.profile || {}
  const r = input.registration || {}
  const pay = input.payment || {}

  if (!input.email?.trim()) e.push('Email is required')
  else if (!EMAIL_RE.test(input.email.trim())) e.push('Enter a valid email address')

  if (!input.password) e.push('Password is required')
  else if (input.password.length < 8) e.push('Password must be at least 8 characters')

  if (!p.firstName?.trim()) e.push('First name is required')
  else if (!NAME_RE.test(p.firstName.trim())) e.push('First name should contain letters only')

  if (!p.lastName?.trim()) e.push('Last name is required')
  else if (!NAME_RE.test(p.lastName.trim())) e.push('Last name should contain letters only')

  if (!p.phone?.trim()) e.push('Phone number is required')
  else if (!PHONE_RE.test(normalisePhone(p.phone))) e.push('Enter a valid 10-digit Indian mobile number')

  if (!p.designation) e.push('Designation is required')
  else if (!conferenceConfig.registration.formFields.designations.includes(p.designation))
    e.push('Select a designation from the list')

  if (!p.institution?.trim()) e.push('Institution is required')
  else if (p.institution.trim().length < 3) e.push('Institution name looks too short')

  if (!p.mciNumber?.trim()) e.push('Medical registration (MCI/NMC) number is required')
  else if (!MCI_RE.test(p.mciNumber.trim())) e.push('Medical registration number looks invalid')

  if (p.address?.pincode && !PINCODE_RE.test(p.address.pincode.trim()))
    e.push('Enter a valid 6-digit PIN code')

  const category = conferenceConfig.registration.categories.find((c) => c.key === r.type)
  if (!r.type) e.push('Select a registration category')
  else if (!category) e.push('Unknown registration category')
  else if (category.requiresMembership && !r.membershipNumber?.trim())
    e.push(`${category.label} requires a membership number`)

  if (pay.method === 'bank-transfer') {
    if (!pay.bankTransferUTR?.trim()) e.push('UTR / transaction reference is required for bank transfer')
    else if (!UTR_RE.test(pay.bankTransferUTR.trim()))
      e.push('UTR should be 6-30 letters or digits, with no spaces')
    if (conferenceConfig.payment.requirePaymentProof && !pay.screenshotUrl)
      e.push('Please attach a screenshot of your payment')
  }

  return e
}
