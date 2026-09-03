/**
 * Dynamic Pricing Seeder
 * Generates pricing tiers from conference.config.ts
 * NO HARDCODED VALUES!
 */

import { conferenceConfig, ConferenceConfig } from '../../config/conference.config'
import Configuration from '../models/Configuration'
import { pricingTiers as configuredPricing, workshops as configuredWorkshops, accompanyingPersonFee } from '../../config/pricing.config'

/**
 * Generate pricing categories dynamically from conference config
 */
function generatePricingCategories(config: ConferenceConfig) {
  const categories: Record<string, any> = {}
  
  // Generate from conference registration categories
  config.registration.categories.forEach(cat => {
    categories[cat.key] = {
      key: cat.key,
      label: cat.label,
      amount: 0, // Will be set by admin or default pricing
      currency: config.payment.currency,
      description: cat.description || '',
      requiresMembership: cat.requiresMembership || false,
      membershipField: cat.membershipField || null
    }
  })
  
  return categories
}

/**
 * Generate pricing tiers with default amounts
 */
export function generateDefaultPricing(config: ConferenceConfig) {
  const tiers: Record<string, any> = {}
  const tierKeys = ['earlyBird', 'regular', 'onsite'] as const

  for (const tierKey of tierKeys) {
    const window = config.payment.tiers[tierKey]
    if (!window?.enabled) continue

    const source = configuredPricing[tierKey]
    const categories = generatePricingCategories(config)

    // Amounts come from config/pricing.config.ts — the published fee matrix.
    // Anything not priced there stays 0 rather than being guessed.
    Object.keys(categories).forEach((catKey) => {
      const configured = source?.categories?.[catKey]
      categories[catKey].amount = typeof configured?.amount === 'number' ? configured.amount : 0
      if (configured?.description) categories[catKey].description = configured.description
      if (configured?.label) categories[catKey].label = configured.label
    })

    tiers[tierKey] = {
      id: source?.id || tierKey,
      name: window.label || source?.name || tierKey,
      description: source?.description || '',
      startDate: window.startDate,
      endDate: window.endDate,
      isActive: true,
      categories,
    }
  }

  return tiers
}

export async function seedPricingTiers(config: ConferenceConfig = conferenceConfig) {
  try {
    const pricing = generateDefaultPricing(config)
    
    await Configuration.findOneAndUpdate(
      { type: 'pricing', key: 'pricing_tiers' },
      {
        type: 'pricing',
        key: 'pricing_tiers',
        value: pricing,
        isActive: true,
        description: 'Conference registration pricing tiers'
      },
      { upsert: true, new: true }
    )
    
    console.log('✅ Pricing tiers seeded successfully')
    return pricing
  } catch (error) {
    console.error('❌ Error seeding pricing tiers:', error)
    throw error
  }
}

/**
 * Seed workshops from config
 */
export async function seedWorkshops(config: ConferenceConfig = conferenceConfig) {
  try {
    // The real programme, from config/pricing.config.ts — no placeholders.
    const workshops = configuredWorkshops.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description || '',
      amount: w.amount,
      currency: w.currency || config.payment.currency,
      ...(typeof w.maxSeats === 'number' ? { maxSeats: w.maxSeats } : {}),
      ...(w.instructor ? { instructor: w.instructor } : {}),
      duration: w.duration || '',
      isActive: true,
    }))

    await Configuration.findOneAndUpdate(
      { type: 'workshops', key: 'workshops_list' },
      {
        type: 'workshops',
        key: 'workshops_list',
        value: workshops,
        isActive: true,
        description: 'Conference workshops',
      },
      { upsert: true, new: true },
    )

    console.log(`✅ Workshops seeded successfully (${workshops.length})`)
    return workshops
  } catch (error) {
    console.error('❌ Error seeding workshops:', error)
    throw error
  }
}

export async function seedAccompanyingPerson(config: ConferenceConfig = conferenceConfig) {
  try {
    // Amount comes from config/pricing.config.ts; 0 when nothing is published.
    const accompanyingConfig = {
      enabled: config.registration.accompanyingPersonEnabled && accompanyingPersonFee.enabled,
      amount: accompanyingPersonFee.amount || 0,
      currency: accompanyingPersonFee.currency || config.payment.currency,
      description: accompanyingPersonFee.label || 'Accompanying Person',
      maxPersons: config.registration.maxAccompanyingPersons || 0
    }
    
    await Configuration.findOneAndUpdate(
      { type: 'pricing', key: 'accompanying_person' },
      {
        type: 'pricing',
        key: 'accompanying_person',
        value: accompanyingConfig,
        isActive: true
      },
      { upsert: true, new: true }
    )
    
    console.log('✅ Accompanying person pricing seeded')
    return accompanyingConfig
  } catch (error) {
    console.error('❌ Error seeding accompanying person:', error)
    throw error
  }
}
