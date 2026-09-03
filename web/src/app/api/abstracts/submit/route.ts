import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Abstract from '@/lib/models/Abstract'
import User from '@/lib/models/User'
import Configuration from '@/lib/models/Configuration'
import { defaultAbstractsSettings, type AbstractsSettings } from '@/lib/config/abstracts'
import { EmailService } from '@/lib/email/service'

// Generate unique abstract ID in format: RegID-ABS-XX
async function generateAbstractId(registrationId: string): Promise<string> {
  const randomNum = Math.floor(Math.random() * 90) + 10 // 10-99
  const baseId = `${registrationId}-ABS-${randomNum.toString().padStart(2, '0')}`
  
  const existing = await Abstract.findOne({ abstractId: baseId })
  if (existing) {
    const newRandomNum = Math.floor(Math.random() * 90) + 10
    return `${registrationId}-ABS-${newRandomNum.toString().padStart(2, '0')}`
  }
  
  return baseId
}

// Load abstracts settings from DB, falling back to defaults
async function getAbstractsSettings(): Promise<AbstractsSettings> {
  try {
    const cfg = await Configuration.findOne({ type: 'abstracts', key: 'settings' })
    return (cfg?.value as AbstractsSettings) || defaultAbstractsSettings
  } catch {
    return defaultAbstractsSettings
  }
}

// Validate submission topic against the configured topics for the chosen specialty
function isValidTopic(settings: AbstractsSettings, submittingFor: string, topic: string): boolean {
  const topics = settings.topicsBySpecialty?.[submittingFor]
  return Array.isArray(topics) && topics.includes(topic)
}

function getSubmittingForLabel(settings: AbstractsSettings, value: string): string {
  return settings.submittingForOptions?.find(o => o.key === value)?.label || value
}

function getSubmissionCategoryLabel(settings: AbstractsSettings, value: string): string {
  const fromConfig = settings.submissionCategories?.find(o => o.key === value)?.label
  if (fromConfig) return fromConfig
  const fallback: Record<string, string> = {
    'award-paper': 'Award Paper',
    'free-paper': 'Free Paper',
    'poster-presentation': 'Poster Presentation',
    'e-poster': 'Poster Presentation'
  }
  return fallback[value] || value
}

export async function POST(request: NextRequest) {
  try {
    // Accept JSON body with blob URL (file already uploaded via client upload)
    const body = await request.json()
    
    const {
      submittingFor,
      submissionCategory,
      submissionTopic,
      title,
      authors: authorsStr,
      abstract: abstractContent,
      keywords: keywordsStr,
      email,
      // File info from client upload
      blobUrl,
      fileName,
      fileSize,
      fileType
    } = body

    // Validate required fields
    if (!submittingFor || !submissionCategory || !submissionTopic) {
      return NextResponse.json(
        { success: false, message: 'Please select Submitting For, Submission Category, and Submission Topic' },
        { status: 400 }
      )
    }

    if (!title || !authorsStr || !email) {
      return NextResponse.json(
        { success: false, message: 'Title, Authors, and Email are required' },
        { status: 400 }
      )
    }

    // File is mandatory - must have blob URL from client upload
    if (!blobUrl) {
      return NextResponse.json(
        { success: false, message: 'Abstract file upload is required (.doc or .docx)' },
        { status: 400 }
      )
    }

    // Load configured options for validation
    await connectDB()
    const settings = await getAbstractsSettings()
    const validSubmittingFor = (settings.submittingForOptions || []).filter(o => o.enabled).map(o => o.key)
    const validCategories = [...(settings.submissionCategories || []).filter(o => o.enabled).map(o => o.key), 'e-poster']

    // Validate submittingFor
    if (!validSubmittingFor.includes(submittingFor)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Submitting For selection' },
        { status: 400 }
      )
    }

    // Validate submissionCategory (accept both legacy and new keys)
    if (!validCategories.includes(submissionCategory)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Submission Category selection' },
        { status: 400 }
      )
    }

    // Normalize category key
    const normalizedCategory = submissionCategory === 'e-poster' ? 'poster-presentation' : submissionCategory

    // Validate submissionTopic
    if (!isValidTopic(settings, submittingFor, submissionTopic)) {
      return NextResponse.json(
        { success: false, message: `Invalid Submission Topic for ${getSubmittingForLabel(settings, submittingFor)}` },
        { status: 400 }
      )
    }

    // Validate word count if provided
    if (abstractContent && abstractContent.trim()) {
      const wordCount = abstractContent.trim().split(/\s+/).filter((word: string) => word.length > 0).length
      if (wordCount > 200) {
        return NextResponse.json(
          { success: false, message: 'Abstract content must not exceed 200 words' },
          { status: 400 }
        )
      }
    }

    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found with this email' },
        { status: 401 }
      )
    }

    const registrationId = user.registration?.registrationId || ''

    // Check submission limits
    const existingAbstracts = await Abstract.find({ userId: user._id })
    const existingInCategory = existingAbstracts.find(
      abs => abs.submittingFor === submittingFor && abs.submissionCategory === normalizedCategory
    )
    if (existingInCategory) {
      return NextResponse.json(
        { success: false, message: `You already have a ${getSubmissionCategoryLabel(settings, normalizedCategory)} submission for ${getSubmittingForLabel(settings, submittingFor)} with ID: ${existingInCategory.abstractId}` },
        { status: 400 }
      )
    }

    // Generate unique abstract ID
    const abstractId = await generateAbstractId(registrationId)

    // File data from client upload
    const fileData = {
      originalName: fileName || 'abstract-file',
      mimeType: fileType || 'application/octet-stream',
      fileSizeBytes: fileSize || 0,
      storagePath: blobUrl,
      blobUrl: blobUrl,
      uploadedAt: new Date()
    }

    // Parse authors and keywords
    const authors = authorsStr.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
    const keywords = keywordsStr ? keywordsStr.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0) : []
    const wordCount = abstractContent ? abstractContent.trim().split(/\s+/).filter((w: string) => w.length > 0).length : 0

    // Find reviewers for auto-assignment
    const availableReviewers = await User.find({ role: 'reviewer', isActive: true }).select('_id')

    // Create abstract
    const abstract = await Abstract.create({
      abstractId,
      userId: user._id,
      registrationId,
      submittingFor,
      submissionCategory: normalizedCategory,
      submissionTopic,
      track: getSubmissionCategoryLabel(settings, normalizedCategory),
      title,
      authors,
      keywords,
      wordCount,
      status: 'submitted',
      initial: { file: fileData, notes: abstractContent },
      assignedReviewerIds: availableReviewers.map(r => r._id)
    })

    // Send confirmation email
    try {
      await EmailService.sendAbstractSubmissionConfirmation({
        userId: user._id.toString(),
        email: user.email,
        name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.email,
        registrationId: user.registration.registrationId,
        abstractId: abstract.abstractId,
        title: abstract.title,
        track: `${getSubmittingForLabel(settings, submittingFor)} - ${getSubmissionCategoryLabel(settings, normalizedCategory)} - ${submissionTopic}`,
        authors: abstract.authors,
        submittedAt: abstract.submittedAt.toISOString()
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      data: {
        abstractId: abstract.abstractId,
        title: abstract.title,
        submittingFor: getSubmittingForLabel(settings, submittingFor),
        submissionCategory: getSubmissionCategoryLabel(settings, normalizedCategory),
        submissionTopic,
        status: abstract.status,
        submittedAt: abstract.submittedAt
      }
    })

  } catch (error) {
    console.error('Abstract submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
