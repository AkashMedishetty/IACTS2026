import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { getCurrentTier, getTierPricing } from '@/lib/registration'
import { conferenceConfig } from '@/config/conference.config'
import mongoose from 'mongoose'

// Category labels mapping
const CATEGORY_LABELS: Record<string, string> = {
  'resident': 'Resident (Postgraduate)',
  'delegate': 'Delegate',
  'accompanying': 'Accompanying Person'
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Allow public access for registration page

    await connectDB()

    // Get current tier and pricing from database or fallback
    const currentTierName = getCurrentTier()
    let categories: Record<string, any> = getTierPricing(currentTierName)
    let tierLabel = currentTierName
    
    // Try to get pricing from configurations collection (seeded data)
    try {
      const db = mongoose.connection.db
      if (db) {
        const today = new Date()
        
        // Pricing tiers are stored in configurations collection
        const pricingConfig = await db.collection('configurations').findOne({ key: 'pricing_tiers' })
        
        if (pricingConfig && pricingConfig.value) {
          // Find the active tier based on current date
          const tiers = pricingConfig.value
          let foundTier = null
          
          for (const [tierKey, tier] of Object.entries(tiers)) {
            if (tierKey === 'specialOffers' || tierKey === 'workshops') continue
            const t = tier as any
            if (!t.isActive || !t.startDate || !t.endDate) continue
            const start = new Date(t.startDate)
            const end = new Date(t.endDate)
            end.setHours(23, 59, 59, 999)
            if (today >= start && today <= end) {
              foundTier = t
              break
            }
          }
          
          if (foundTier && foundTier.categories) {
            console.log('📊 Found active pricing tier from database:', foundTier.name)
            categories = foundTier.categories
            tierLabel = foundTier.name
          } else {
            console.log('📊 No active tier found for today, using fallback')
          }
        }
      }
    } catch (error) {
      console.log('Using fallback pricing - database query failed:', error)
    }

    // Admin-only categories that should not appear in user-facing registration
    const ADMIN_ONLY_CATEGORIES = ['international', 'complimentary', 'sponsored', 'accompanying']

    // Convert categories object to array format for frontend
    // Filter out admin-only categories
    const registrationTypes = Object.entries(categories)
      .filter(([key]) => !ADMIN_ONLY_CATEGORIES.includes(key))
      .map(([key, value]: [string, any]) => ({
        key,
        label: CATEGORY_LABELS[key] || conferenceConfig.registration.categories.find(c => c.key === key)?.label || key,
        price: value.amount,
        currency: value.currency || 'INR',
        description: `${tierLabel} pricing`
      }))

    return NextResponse.json({
      success: true,
      data: registrationTypes
    })

  } catch (error) {
    console.error('Registration types fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
