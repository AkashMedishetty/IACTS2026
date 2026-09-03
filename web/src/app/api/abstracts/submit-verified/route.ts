import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Abstract from '@/lib/models/Abstract'
import User from '@/lib/models/User'
import { EmailService } from '@/lib/email/service'

// Abstract submission identified by Email + Mobile (matches the registration),
// instead of a password login.

async function generateAbstractId(registrationId: string): Promise<string> {
  const randomNum = Math.floor(Math.random() * 90) + 10
  const baseId = `${registrationId}-ABS-${randomNum.toString().padStart(2, '0')}`
  const existing = await Abstract.findOne({ abstractId: baseId })
  if (existing) {
    const newRandomNum = Math.floor(Math.random() * 90) + 10
    return `${registrationId}-ABS-${newRandomNum.toString().padStart(2, '0')}`
  }
  return baseId
}

function getSubmissionCategoryLabel(value: string): string {
  const labels: Record<string, string> = {
    'award-paper': 'Award Paper',
    'free-paper': 'Free Paper',
    'poster-presentation': 'Poster Presentation',
    'e-poster': 'Poster Presentation',
  }
  return labels[value] || value
}

const onlyDigits = (s: string) => (s || '').replace(/\D/g, '')

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const {
      email,
      mobile,
      submissionCategory,
      presenterCategory,
      title,
      authors: authorsStr,
      abstract: abstractContent,
      keywords: keywordsStr,
      blobUrl,
      fileName,
      fileSize,
      fileType,
    } = body

    if (!email || !mobile) {
      return NextResponse.json({ success: false, message: 'Email and mobile number are required' }, { status: 400 })
    }

    // Identify the registrant by email
    const user = await User.findOne({ email: String(email).toLowerCase().trim() })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No registration found for this email. Please register for the conference first.' },
        { status: 404 },
      )
    }

    // Verify the mobile number matches the registration (compare last 10 digits)
    const regPhone = onlyDigits(user.profile?.phone || (user as { phone?: string }).phone || '')
    const givenPhone = onlyDigits(mobile)
    const phoneMatches = regPhone.length >= 10 && givenPhone.length >= 10 && regPhone.slice(-10) === givenPhone.slice(-10)
    if (!phoneMatches) {
      return NextResponse.json(
        { success: false, message: 'Mobile number does not match our registration records for this email.' },
        { status: 401 },
      )
    }

    // Allow pending-payment users to submit
    const validStatuses = ['completed', 'paid', 'confirmed', 'pending-payment', 'pending']
    if (!validStatuses.includes(user.registration?.status)) {
      return NextResponse.json(
        { success: false, message: 'You must complete registration before submitting abstracts.' },
        { status: 403 },
      )
    }

    if (!submissionCategory) {
      return NextResponse.json({ success: false, message: 'Please select a Submission Category' }, { status: 400 })
    }
    if (submissionCategory === 'free-paper' && !presenterCategory) {
      return NextResponse.json(
        { success: false, message: 'Please select your category: Postgraduate, Junior Consultant, or Senior Consultant' },
        { status: 400 },
      )
    }
    if (!title || !authorsStr) {
      return NextResponse.json({ success: false, message: 'Title and Authors are required' }, { status: 400 })
    }
    if (!blobUrl) {
      return NextResponse.json({ success: false, message: 'Abstract file upload is required (.doc or .docx)' }, { status: 400 })
    }

    const validCategories = ['award-paper', 'free-paper', 'poster-presentation', 'e-poster']
    if (!validCategories.includes(submissionCategory)) {
      return NextResponse.json({ success: false, message: 'Invalid Submission Category selection' }, { status: 400 })
    }
    const normalizedCategory = submissionCategory === 'e-poster' ? 'poster-presentation' : submissionCategory

    if (abstractContent && abstractContent.trim()) {
      const wordCount = abstractContent.trim().split(/\s+/).filter((w: string) => w.length > 0).length
      if (wordCount > 200) {
        return NextResponse.json({ success: false, message: 'Abstract content must not exceed 200 words' }, { status: 400 })
      }
    }

    // One submission per category
    const existingAbstracts = await Abstract.find({ userId: user._id })
    const existingInCategory = existingAbstracts.find((abs) => abs.submissionCategory === normalizedCategory)
    if (existingInCategory) {
      return NextResponse.json(
        { success: false, message: `You already have a ${getSubmissionCategoryLabel(normalizedCategory)} submission with ID: ${existingInCategory.abstractId}` },
        { status: 400 },
      )
    }

    const abstractId = await generateAbstractId(user.registration.registrationId)
    const fileData = {
      originalName: fileName || 'abstract-file',
      mimeType: fileType || 'application/octet-stream',
      fileSizeBytes: fileSize || 0,
      storagePath: blobUrl,
      blobUrl,
      uploadedAt: new Date(),
    }
    const authors = authorsStr.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
    const keywords = keywordsStr ? keywordsStr.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0) : []
    const wordCount = abstractContent ? abstractContent.trim().split(/\s+/).filter((w: string) => w.length > 0).length : 0
    const availableReviewers = await User.find({ role: 'reviewer', isActive: true }).select('_id')

    const trackLabel = presenterCategory
      ? `${getSubmissionCategoryLabel(normalizedCategory)} - ${presenterCategory}`
      : getSubmissionCategoryLabel(normalizedCategory)

    const abstract = await Abstract.create({
      abstractId,
      userId: user._id,
      registrationId: user.registration.registrationId,
      submissionCategory: normalizedCategory,
      category: presenterCategory || undefined,
      track: trackLabel,
      title,
      authors,
      keywords,
      wordCount,
      status: 'submitted',
      initial: { file: fileData, notes: abstractContent },
      assignedReviewerIds: availableReviewers.map((r) => r._id),
    })

    try {
      await EmailService.sendAbstractSubmissionConfirmation({
        userId: user._id.toString(),
        email: user.email,
        name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.email,
        registrationId: user.registration.registrationId,
        abstractId: abstract.abstractId,
        title: abstract.title,
        track: trackLabel,
        authors: abstract.authors,
        submittedAt: abstract.submittedAt.toISOString(),
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      data: {
        abstractId: abstract.abstractId,
        title: abstract.title,
        submissionCategory: getSubmissionCategoryLabel(normalizedCategory),
        presenterCategory: presenterCategory || null,
        status: abstract.status,
        submittedAt: abstract.submittedAt,
      },
    })
  } catch (error) {
    console.error('Abstract submit-verified error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
