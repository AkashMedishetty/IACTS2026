/**
 * Pricing Configuration
 * 
 * Define all pricing for registration categories, workshops, and extras.
 * This can be easily updated without touching code.
 */

import { conferenceConfig } from './conference.config'

export interface PricingCategory {
  key: string
  label: string
  amount: number
  currency: string
  description?: string
  ageBasedFree?: {
    enabled: boolean
    minAge: number
    applicableCategories: string[]
  }
}

export interface Workshop {
  id: string
  name: string
  description?: string
  amount: number
  currency: string
  maxSeats?: number
  instructor?: string
  duration?: string
}

export interface PricingTier {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  categories: Record<string, PricingCategory>
}

/**
 * PRICING TIERS
 * Define different pricing for early bird, regular, and onsite registration
 * Note: These are default values - actual pricing is managed via admin panel
 */
export const pricingTiers: Record<string, PricingTier> = {
  earlyBird: {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Includes complimentary twin-sharing accommodation at the venue',
    startDate: conferenceConfig.payment.tiers.earlyBird?.startDate || '2026-01-01',
    endDate: conferenceConfig.payment.tiers.earlyBird?.endDate || '2026-09-27',
    isActive: true,
    categories: {
      'resident': { key: 'resident', label: 'Resident / Trainee', amount: 3000, currency: 'INR', description: 'Includes free twin-sharing accommodation' },
      'iacts-member': { key: 'iacts-member', label: 'IACTS Member', amount: 5000, currency: 'INR', description: 'Includes free twin-sharing accommodation' },
      'non-member': { key: 'non-member', label: 'Non-Member', amount: 7000, currency: 'INR', description: 'Includes free twin-sharing accommodation' },
      'complimentary': { key: 'complimentary', label: 'Complimentary', amount: 0, currency: 'INR' },
      'sponsored': { key: 'sponsored', label: 'Sponsored', amount: 0, currency: 'INR' }
    }
  },
  regular: {
    id: 'standard',
    name: 'Standard',
    description: 'Standard registration',
    startDate: conferenceConfig.payment.tiers.regular?.startDate || '2026-09-28',
    endDate: conferenceConfig.payment.tiers.regular?.endDate || '2026-10-11',
    isActive: true,
    categories: {
      'resident': { key: 'resident', label: 'Resident / Trainee', amount: 5000, currency: 'INR' },
      'iacts-member': { key: 'iacts-member', label: 'IACTS Member', amount: 7000, currency: 'INR' },
      'non-member': { key: 'non-member', label: 'Non-Member', amount: 9000, currency: 'INR' },
      'complimentary': { key: 'complimentary', label: 'Complimentary', amount: 0, currency: 'INR' },
      'sponsored': { key: 'sponsored', label: 'Sponsored', amount: 0, currency: 'INR' }
    }
  },
  onsite: {
    id: 'spot',
    name: 'Spot Registration',
    description: 'On-site registration at the venue',
    startDate: conferenceConfig.payment.tiers.onsite?.startDate || '2026-10-12',
    endDate: conferenceConfig.payment.tiers.onsite?.endDate || '2026-10-25',
    isActive: true,
    categories: {
      'resident': { key: 'resident', label: 'Resident / Trainee', amount: 7000, currency: 'INR' },
      'iacts-member': { key: 'iacts-member', label: 'IACTS Member', amount: 10000, currency: 'INR' },
      'non-member': { key: 'non-member', label: 'Non-Member', amount: 12000, currency: 'INR' },
      'complimentary': { key: 'complimentary', label: 'Complimentary', amount: 0, currency: 'INR' },
      'sponsored': { key: 'sponsored', label: 'Sponsored', amount: 0, currency: 'INR' }
    }
  }
}

export const workshops: Workshop[] = [
  { id: 'wet-lab',    name: 'Hands-on Wet Lab Sessions',   description: 'Cadaveric', amount: 0, currency: 'INR', duration: 'October 23, 2026' },
  { id: 'robotic-sim', name: 'Robotic Simulation Training', description: 'Simulator', amount: 0, currency: 'INR', duration: 'October 23, 2026' },
  { id: 'suturing',   name: 'Suturing & Anastomosis Lab',  description: 'Bench',     amount: 0, currency: 'INR', duration: 'October 23, 2026' },
  { id: 'endovascular', name: 'Endovascular Skills Workshop', description: 'Cath lab', amount: 0, currency: 'INR', duration: 'October 23, 2026' },
  { id: 'perfusion',  name: 'Perfusion & ECMO Basics',     description: 'Circuit',   amount: 0, currency: 'INR', duration: 'October 23, 2026' }
]

export const accompanyingPersonFee = {
  // Not announced by the committee.
  enabled: false,
  amount: 0,
  currency: 'INR',
  label: 'Accompanying Person'
}

export interface DiscountCode {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  description: string
  validFrom: string
  validTo: string
  isActive: boolean
  maxUses?: number
  currentUses?: number
  applicableCategories?: string[]
}

export const discountCodes: DiscountCode[] = []

export function getCurrentTierPricing(): PricingTier {
  const today = new Date()
  
  for (const [key, tier] of Object.entries(pricingTiers)) {
    if (!tier.isActive) continue
    const start = new Date(tier.startDate)
    const end = new Date(tier.endDate)
    if (today >= start && today <= end) {
      return tier
    }
  }
  
  return pricingTiers.regular
}

/**
 * Get pricing for a specific category
 */
export function getCategoryPricing(categoryKey: string, tierKey?: string): PricingCategory | null {
  const tier = tierKey ? pricingTiers[tierKey] : getCurrentTierPricing()
  return tier?.categories[categoryKey] || null
}

/**
 * Calculate total registration cost
 */
export interface PriceCalculation {
  baseAmount: number
  workshopFees: number
  accompanyingPersonFees: number
  subtotal: number
  discountAmount: number
  total: number
  currency: string
  breakdown: {
    registration: { label: string; amount: number }
    workshops: { name: string; amount: number }[]
    accompanyingPersons: { count: number; amount: number }
    discount?: { code: string; percentage: number; amount: number }
  }
}

export function calculatePrice(params: {
  registrationType: string
  workshopIds?: string[]
  accompanyingPersonCount?: number
  discountCode?: string
  age?: number
}): PriceCalculation {
  const { registrationType, workshopIds = [], accompanyingPersonCount = 0, discountCode, age = 0 } = params
  
  const categoryPricing = getCategoryPricing(registrationType)
  if (!categoryPricing) {
    throw new Error('Invalid registration type')
  }
  
  let baseAmount = categoryPricing.amount
  
  if (categoryPricing.ageBasedFree?.enabled && 
      age >= categoryPricing.ageBasedFree.minAge &&
      categoryPricing.ageBasedFree.applicableCategories.includes(registrationType)) {
    baseAmount = 0
  }
  
  const workshopDetails = workshopIds
    .map(id => workshops.find(w => w.id === id))
    .filter(Boolean) as Workshop[]
  
  const workshopFees = workshopDetails.reduce((sum, w) => sum + w.amount, 0)
  const accompanyingPersonFees = accompanyingPersonCount * accompanyingPersonFee.amount
  const subtotal = baseAmount + workshopFees + accompanyingPersonFees
  
  let discountAmount = 0
  let discountDetails: { code: string; percentage: number; amount: number } | undefined
  
  if (discountCode) {
    const discount = discountCodes.find(d => 
      d.code === discountCode && 
      d.isActive &&
      new Date() >= new Date(d.validFrom) &&
      new Date() <= new Date(d.validTo) &&
      (!d.applicableCategories || d.applicableCategories.includes(registrationType))
    )
    
    if (discount) {
      if (discount.type === 'percentage') {
        discountAmount = Math.round((subtotal * discount.value) / 100)
      } else {
        discountAmount = discount.value
      }
      discountDetails = {
        code: discount.code,
        percentage: discount.type === 'percentage' ? discount.value : 0,
        amount: discountAmount
      }
    }
  }
  
  const total = Math.max(0, subtotal - discountAmount)
  
  return {
    baseAmount,
    workshopFees,
    accompanyingPersonFees,
    subtotal,
    discountAmount,
    total,
    currency: conferenceConfig.payment.currency,
    breakdown: {
      registration: { label: categoryPricing.label, amount: baseAmount },
      workshops: workshopDetails.map(w => ({ name: w.name, amount: w.amount })),
      accompanyingPersons: { count: accompanyingPersonCount, amount: accompanyingPersonFees },
      discount: discountDetails
    }
  }
}

/**
 * Validate discount code
 */
export function validateDiscountCode(code: string, registrationType?: string): {
  valid: boolean
  discount?: DiscountCode
  message?: string
} {
  const discount = discountCodes.find(d => d.code === code)
  
  if (!discount) return { valid: false, message: 'Invalid discount code' }
  if (!discount.isActive) return { valid: false, message: 'This discount code is no longer active' }
  
  const today = new Date()
  if (today < new Date(discount.validFrom)) return { valid: false, message: 'This discount code is not yet valid' }
  if (today > new Date(discount.validTo)) return { valid: false, message: 'This discount code has expired' }
  if (discount.maxUses && (discount.currentUses || 0) >= discount.maxUses) return { valid: false, message: 'This discount code has reached its maximum usage limit' }
  if (registrationType && discount.applicableCategories && !discount.applicableCategories.includes(registrationType)) return { valid: false, message: 'This discount code is not applicable to your registration type' }
  
  return { valid: true, discount }
}
