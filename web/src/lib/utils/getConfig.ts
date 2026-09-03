import connectDB from '../mongodb'
import ConferenceConfig from '../models/ConferenceConfig'
import { defaultRegistrationCategories, defaultFormFields } from '@/lib/utils/defaultRegistrationCategories'

// Cache for config to avoid repeated database calls
let cachedConfig: any = null
let lastFetchTime = 0
const CACHE_DURATION = 60000 // 1 minute

export async function getDatabaseConfig() {
  try {
    // Return cached config if recent
    const now = Date.now()
    if (cachedConfig && (now - lastFetchTime) < CACHE_DURATION) {
      return cachedConfig
    }
    
    await connectDB()
    
    let config = await ConferenceConfig.findOne().lean()
    
    // If no config exists, create default
    if (!config) {
      config = await ConferenceConfig.create({
        registration: {
          enabled: true,
          formFields: defaultFormFields(),
          categories: defaultRegistrationCategories(),
          workshopsEnabled: true,
          maxWorkshopsPerUser: 3,
          accompanyingPersonEnabled: true,
          maxAccompanyingPersons: 2
        },
        pricingTiers: [],
        workshops: [],
        currency: 'INR',
        currencySymbol: '₹'
      })
    }
    
    // Cache the config
    cachedConfig = config
    lastFetchTime = now
    
    return config
  } catch (error) {
    console.error('Error loading database config:', error)
    // Return fallback config
    return {
      registration: {
        enabled: true,
        formFields: defaultFormFields(),
        categories: defaultRegistrationCategories()
      }
    }
  }
}

// Clear cache (call this after updating config)
export function clearConfigCache() {
  cachedConfig = null
  lastFetchTime = 0
}
