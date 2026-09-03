import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Configuration from '@/lib/models/Configuration'
import Workshop from '@/lib/models/Workshop'
import { getCurrentTier, getTierPricing, memberCategoryKey, tierLabel, getCategoryAmount } from '@/lib/registration'
import { calculateGST } from '@/lib/utils/gst'
import { isEarlyBirdFaculty } from '@/config/conference.config'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { registrationType, workshopSelections = [], accompanyingPersons = [], discountCode, age = 0, accommodation, phone } = body
    
    if (!registrationType) {
      return NextResponse.json({
        success: false,
        message: 'Registration type is required'
      }, { status: 400 })
    }

    // Get current tier and pricing
    const currentTierName = getCurrentTier()
    let categories = getTierPricing(currentTierName)
    let accompanyingPersonFee = categories['accompanying']?.amount || 0
    
    // Try to get pricing from pricing_tiers collection (seeded data)
    const db = mongoose.connection.db
    if (db) {
      try {
        const today = new Date()
        const activeTier = await db.collection('pricing_tiers').findOne({
          active: true,
          startDate: { $lte: today },
          endDate: { $gte: today }
        })
        
        if (activeTier && activeTier.categories) {
          console.log('📊 Using pricing from database tier:', activeTier.name)
          categories = activeTier.categories
          accompanyingPersonFee = activeTier.categories['accompanying']?.amount || 0
        }
      } catch (error) {
        console.log('Error fetching from pricing_tiers, using fallback')
      }
    }
    
    // Also try configurations collection (admin-saved) for pricing amounts
    // But use getCurrentTier() for tier selection (source of truth for dates)
    let currentTierKey = currentTierName === 'Early Bird' ? 'earlyBird' : currentTierName === 'Spot Registration' ? 'onsite' : 'regular'
    try {
      const adminPricingConfig = await Configuration.findOne({ 
        type: 'pricing', 
        key: 'pricing_tiers', 
        isActive: true 
      })
      
      if (adminPricingConfig?.value) {
        const tiers = adminPricingConfig.value
        
        // Use the tier determined by getCurrentTier() (from registration.ts)
        let selectedTier = null
        if (currentTierKey === 'earlyBird' && tiers.earlyBird) { 
          selectedTier = tiers.earlyBird
        } else if (currentTierKey === 'onsite' && tiers.onsite) { 
          selectedTier = tiers.onsite
        } else if (tiers.regular) { 
          selectedTier = tiers.regular
        }
        
        if (selectedTier?.categories) {
          categories = selectedTier.categories
          accompanyingPersonFee = selectedTier.categories['accompanying']?.amount || 0
        }
      }
    } catch (error) {
      console.log('Using fallback pricing - configurations unavailable')
    }

    // Try to get accompanying person fee from dedicated config
    try {
      const accConfig = await Configuration.findOne({
        type: 'pricing',
        key: 'accompanying_person',
        isActive: true
      })
      if (accConfig?.value) {
        const tierFee = accConfig.value.tierPricing?.[currentTierKey]
        accompanyingPersonFee = tierFee ?? accConfig.value.basePrice ?? accompanyingPersonFee
        console.log('📊 Accompanying person fee from config:', accompanyingPersonFee, 'tier:', currentTierKey)
      }
    } catch (error) {
      console.log('Using fallback accompanying person fee')
    }

    // Calculate base registration fee
    // Faculty pays the configured member rate.
    const pricingType = registrationType === 'faculty' ? memberCategoryKey() : registrationType
    const registrationCategory = categories[pricingType]
    if (!registrationCategory) {
      return NextResponse.json({
        success: false,
        message: `Invalid registration type: ${registrationType}`
      }, { status: 400 })
    }
    
    // Get age exemption rules from database
    let seniorCitizenAge = 999  // Default to disabled (very high age)
    let seniorCitizenCategory = 'none'  // Default to no category
    let seniorCitizenEnabled = false
    let childrenUnderAge = 10
    
    try {
      const ageExemptionsConfig = await Configuration.findOne({
        type: 'pricing',
        key: 'age_exemptions',
        isActive: true
      })
      
      if (ageExemptionsConfig?.value) {
        // Only apply senior citizen exemption if explicitly enabled
        seniorCitizenEnabled = ageExemptionsConfig.value.senior_citizen_enabled === true
        if (seniorCitizenEnabled) {
          seniorCitizenAge = ageExemptionsConfig.value.senior_citizen_age || 999
          seniorCitizenCategory = ageExemptionsConfig.value.senior_citizen_category || 'none'
        }
        childrenUnderAge = ageExemptionsConfig.value.children_under_age || 10
      }
    } catch (error) {
      console.log('Using fallback age exemptions')
    }
    
    // Apply age-based free registration for senior citizens (only if enabled)
    let baseAmount = registrationCategory?.amount || 0
    const currency = registrationCategory?.currency || 'INR'
    let registrationLabel = registrationType === 'faculty' ? 'Faculty' : (registrationCategory?.label || registrationType)

    // Early Bird override for listed faculty (by phone) — charge the Early Bird member rate
    const earlyBirdFaculty = registrationType === 'faculty' && isEarlyBirdFaculty(phone)
    if (earlyBirdFaculty) {
      let ebAmount = getCategoryAmount(memberCategoryKey(), tierLabel('earlyBird'))
      try {
        const ebCfg = await Configuration.findOne({ type: 'pricing', key: 'pricing_tiers', isActive: true })
        const cfgAmt = ebCfg?.value?.earlyBird?.categories?.[memberCategoryKey()]?.amount
        if (typeof cfgAmt === 'number' && cfgAmt > 0) ebAmount = cfgAmt
      } catch { /* fall back to static early-bird amount */ }
      baseAmount = ebAmount
      registrationLabel = 'Faculty (Early Bird)'
    }
    
    // Check if senior citizen exemption applies (only if enabled)
    const appliesForSeniorExemption = 
      seniorCitizenEnabled &&
      age >= seniorCitizenAge && 
      (seniorCitizenCategory === 'all' || seniorCitizenCategory === registrationType)
    
    if (appliesForSeniorExemption) {
      baseAmount = 0
    }

    // GST will be calculated after all fees are computed

    // Get workshops from Workshop collection
    let workshops: any[] = []
    try {
      const workshopDocs = await Workshop.find({ isActive: true })
      workshops = workshopDocs.map(w => ({
        id: w.id,
        name: w.name,
        amount: w.price,
        currency: w.currency
      }))
    } catch (error) {
      console.error('Error fetching workshops:', error)
    }

    // Calculate workshop fees
    let workshopFees: Array<{ name: string; amount: number }> = []
    let totalWorkshopFees = 0

    if (workshopSelections && workshopSelections.length > 0) {
      workshopSelections.forEach((workshopId: string) => {
        const workshop = workshops.find(w => w.id === workshopId)
        if (workshop) {
          workshopFees.push({
            name: workshop.name,
            amount: workshop.amount
          })
          totalWorkshopFees += workshop.amount
        }
      })
    }
    
    // Calculate accompanying person fees
    let totalAccompanyingFees = 0
    let accompanyingPersonCount = 0
    let freeChildrenCount = 0
    let accompanyingBreakdown: Array<{ name: string; age: number; amount: number; isFree: boolean }> = []
    
    if (accompanyingPersons && accompanyingPersons.length > 0) {
      accompanyingPersons.forEach((person: any) => {
        const personAge = person.age || 0
        const personName = person.name || 'Accompanying Person'
        
        if (personAge < childrenUnderAge) {
          freeChildrenCount++
          accompanyingBreakdown.push({
            name: personName,
            age: personAge,
            amount: 0,
            isFree: true
          })
        } else {
          accompanyingPersonCount++
          totalAccompanyingFees += accompanyingPersonFee
          accompanyingBreakdown.push({
            name: personName,
            age: personAge,
            amount: accompanyingPersonFee,
            isFree: false
          })
        }
      })
    }

    // Calculate accommodation fees
    let accommodationFees = 0
    let accommodationNights = 0
    let accommodationBreakdown: { roomType: string; checkIn: string; checkOut: string; nights: number; perNight: number; total: number } | null = null

    if (accommodation && accommodation.roomType && accommodation.checkIn && accommodation.checkOut) {
      const checkIn = new Date(accommodation.checkIn)
      const checkOut = new Date(accommodation.checkOut)
      accommodationNights = Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
      const perNight = accommodation.roomType === 'single' ? 10000 : 7500
      accommodationFees = accommodationNights * perNight
      accommodationBreakdown = {
        roomType: accommodation.roomType,
        checkIn: accommodation.checkIn,
        checkOut: accommodation.checkOut,
        nights: accommodationNights,
        perNight,
        total: accommodationFees
      }
    }

    // Calculate GST (18% on all fees: registration + workshops + accompanying persons + accommodation)
    const preGstTotal = baseAmount + totalWorkshopFees + totalAccompanyingFees + accommodationFees
    const gstAmount = calculateGST(preGstTotal)

    // Calculate subtotal (all fees + GST)
    const subtotal = preGstTotal + gstAmount

    // Apply discounts (if any)
    let totalDiscount = 0
    const appliedDiscounts: Array<{
      type: string
      code?: string
      percentage: number
      amount: number
    }> = []

    if (discountCode) {
      try {
        const discountConfigs = await Configuration.find({
          type: 'discounts',
          isActive: true
        })

        const currentDate = new Date()
        discountConfigs.forEach(config => {
          if (config.value && Array.isArray(config.value)) {
            config.value.forEach((discount: any) => {
              if (discount.code === discountCode && discount.isActive) {
                const discountEndDate = new Date(discount.endDate)
                if (currentDate <= discountEndDate) {
                  const discountAmount = Math.floor((subtotal * discount.percentage) / 100)
                  totalDiscount += discountAmount
                  appliedDiscounts.push({
                    type: discount.type || 'code-based',
                    code: discount.code,
                    percentage: discount.percentage,
                    amount: discountAmount
                  })
                }
              }
            })
          }
        })
      } catch (error) {
        console.log('Error applying discount:', error)
      }
    }

    // Calculate final total
    const total = subtotal - totalDiscount
    const finalAmount = Math.max(total, 0)

    const calculationData = {
      baseAmount,
      registrationFee: baseAmount,
      registrationLabel,
      gst: gstAmount,
      workshopFees: totalWorkshopFees,
      accompanyingPersons: totalAccompanyingFees,
      accompanyingPersonFees: totalAccompanyingFees,
      accompanyingPersonCount,
      freeChildrenCount,
      accommodationFees,
      accommodationNights,
      accommodationBreakdown,
      subtotal,
      discount: totalDiscount,
      total: finalAmount,
      finalAmount,
      currency,
      breakdown: {
        registration: {
          type: registrationType,
          label: registrationLabel,
          amount: baseAmount
        },
        gst: gstAmount,
        gstPercentage: 18,
        workshops: workshopFees,
        accompanyingPersons: accompanyingBreakdown,
        accompanyingPersonFeePerPerson: accompanyingPersonFee,
        accommodation: accommodationBreakdown,
        appliedDiscounts,
        tier: currentTierName
      }
    }

    console.log('💰 Price calculation result:', JSON.stringify(calculationData, null, 2))

    return NextResponse.json({
      success: true,
      data: calculationData
    })

  } catch (error) {
    console.error('Price calculation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}