import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Configuration from '@/lib/models/Configuration'
import AbstractsConfig from '@/lib/models/AbstractsConfig'
import { defaultAbstractsSettings } from '@/lib/config/abstracts'
import { conferenceConfig } from '@/config/conference.config'

const CONFIG_TYPE = 'abstracts'
const CONFIG_KEY = 'settings'

// Public endpoint - no auth required
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const config = await Configuration.findOne({ type: CONFIG_TYPE, key: CONFIG_KEY })
    
    // Also fetch the new AbstractsConfig for guidelines, templates, and submission window
    const abstractsConfig = await AbstractsConfig.findOne({})
    
    // Check if abstract submission feature is enabled in admin panel
    const featureConfig = await Configuration.findOne({ type: 'features', key: 'abstractSubmission' })
    const isFeatureEnabled = featureConfig?.value ?? conferenceConfig.features.abstractSubmission
    
    // Return config or defaults
    const settings = config?.value || defaultAbstractsSettings

    /**
     * PRECEDENCE: stored admin setting -> AbstractsConfig -> COMPILED config.
     *
     * The old chain ended in a hardcoded `false`, so when no admin document
     * existed the endpoint served `defaultAbstractsSettings` — whose window is
     * `enabled: false` with dates computed as `now` to `now + 90 days`. That is
     * where the phantom "8 December 2026" deadline came from, and why the
     * committee's own published window (1 Jan - 11 Oct 2026, enabled) in
     * conference.config.ts had no effect at all.
     *
     * Two things matter in this fix:
     *  1. `defaultAbstractsSettings` is NOT an explicit source. It is only read
     *     when nothing real exists, so it must not shadow the compiled config —
     *     hence `storedSettings` is kept separate from `settings`.
     *  2. Presence, not truthiness. An operator who deliberately CLOSES
     *     submissions sets `enabled: false`, and `||` would discard that and
     *     fall through to the compiled `true`. So a stored boolean wins even
     *     when it is false.
     */
    const storedSettings = (config?.value ?? null) as typeof defaultAbstractsSettings | null
    const compiled = conferenceConfig.abstracts

    const firstBool = (...vals: unknown[]) =>
      vals.find((v): v is boolean => typeof v === 'boolean')
    const firstDate = (...vals: unknown[]) => {
      const hit = vals.find(
        (v) => (typeof v === 'string' && v.length > 0) || v instanceof Date,
      )
      if (!hit) return undefined
      return hit instanceof Date ? hit.toISOString() : (hit as string)
    }

    const submissionWindowEnabled =
      firstBool(
        storedSettings?.submissionWindow?.enabled,
        abstractsConfig?.submissionWindow?.enabled,
        compiled.submissionWindow?.enabled,
      ) ?? false
    /**
     * DATE precedence deliberately differs from the ENABLED precedence above:
     * the compiled config outranks the legacy AbstractsConfig row.
     *
     * Why: the AbstractsConfig record carries 3 Sep - 3 Oct 2026, but the
     * committee's published rule 10 says "Final date for submission is
     * 11 October 2026" — and that rule renders on this very page. Trusting the
     * stored row would have the page contradict itself AND close submissions
     * eight days early. The 11 Oct date is version-controlled in two places
     * (submissionWindow.end and submissionRules), so it is the committee's
     * actual decision; the stored row is leftover from the synthetic
     * `now + 90 days` defaults.
     *
     * A deliberate admin setting in the Configuration document still wins, so
     * the committee can move the date from the admin panel without a deploy.
     */
    const submissionStart = firstDate(
      storedSettings?.submissionWindow?.start,
      compiled.submissionWindow?.start,
      abstractsConfig?.submissionOpenDate,
    )
    const submissionEnd = firstDate(
      storedSettings?.submissionWindow?.end,
      compiled.submissionWindow?.end,
      abstractsConfig?.submissionCloseDate,
    )

    // Also check enableAbstractsWithoutRegistration from both sources
    const enableAbstractsWithoutRegistration = settings.enableAbstractsWithoutRegistration || abstractsConfig?.enableAbstractsWithoutRegistration || false
    
    // Check if submissions are open based on dates
    const now = new Date()
    let isOpen = false
    let daysRemaining = 0
    
    if (submissionWindowEnabled && submissionStart && submissionEnd) {
      const startDate = new Date(submissionStart)
      const endDate = new Date(submissionEnd)
      isOpen = now >= startDate && now <= endDate
      daysRemaining = isOpen ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
    } else if (submissionWindowEnabled) {
      // If enabled but no dates set, treat as open
      isOpen = true
    }
    
    // Final submission window — enabled (dates overridden / always open)
    const isFinalSubmissionOpen = true
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...settings,
        // Override submissionWindow with merged data
        submissionWindow: {
          ...settings.submissionWindow,
          enabled: submissionWindowEnabled,
          start: submissionStart || settings.submissionWindow?.start,
          end: submissionEnd || settings.submissionWindow?.end,
        },
        enableAbstractsWithoutRegistration,
        featureEnabled: isFeatureEnabled,
        isCurrentlyOpen: isOpen && isFeatureEnabled,
        daysRemaining,
        // Add guidelines and templates from AbstractsConfig
        guidelines: abstractsConfig?.guidelines || settings.guidelines || null,
        fileRequirements: abstractsConfig?.fileRequirements || null,
        isFinalSubmissionOpen,
        finalSubmissionDeadline: abstractsConfig?.finalSubmissionCloseDate || null
      }
    })
  } catch (error) {
    console.error('Abstracts config fetch error:', error)
    // Return defaults on error
    return NextResponse.json({ success: true, data: { ...defaultAbstractsSettings, featureEnabled: true } })
  }
}


