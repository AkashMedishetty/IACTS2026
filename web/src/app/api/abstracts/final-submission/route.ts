import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Abstract from '@/lib/models/Abstract'
import User from '@/lib/models/User'
import { EmailService } from '@/lib/email/service'
import { conferenceConfig } from '@/config/conference.config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 })
    }

    await connectDB()

    const userId = (session.user as any).id
    const user = await User.findById(userId)
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    if (!conferenceConfig.abstracts.finalSubmissionOpen) {
      return NextResponse.json({ success: false, message: 'Final submission is closed' }, { status: 400 })
    }

    /* The browser has already uploaded the file to Vercel Blob (signed by
       /api/abstracts/final-submission/upload). This records it. Files used to
       be written to the server's own disk, which on Vercel is read-only and
       discarded between requests — and request bodies are capped at 4.5 MB —
       so no final presentation could have been stored. */
    const { abstractId, blobUrl, originalName, mimeType, fileSizeBytes, notes } = await request.json()

    if (!abstractId) {
      return NextResponse.json({ success: false, message: 'Abstract ID is required' }, { status: 400 })
    }
    if (!blobUrl || !/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i.test(blobUrl)) {
      return NextResponse.json({ success: false, message: 'Final presentation file is required' }, { status: 400 })
    }

    const abstract = await Abstract.findById(abstractId)
    if (!abstract) {
      return NextResponse.json({ success: false, message: 'Abstract not found' }, { status: 404 })
    }
    if (abstract.userId.toString() !== userId) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }
    // Open to every submitted abstract — no acceptance step (committee
    // instruction, 19 October 2026). Only a rejected abstract is excluded.
    if (abstract.status === 'rejected') {
      return NextResponse.json({ success: false, message: 'This abstract is not eligible for final submission' }, { status: 400 })
    }

    const name = String(originalName || 'final-presentation')
    if (!/\.(pptx?|pdf|docx?)$/i.test(name)) {
      return NextResponse.json({ success: false, message: 'Only PowerPoint, PDF and Word files are allowed' }, { status: 400 })
    }
    const file = { name, type: String(mimeType || ''), size: Number(fileSizeBytes) || 0 }

    // Generate final display ID
    const finalDisplayId = `${abstract.abstractId}-F`

    // Update abstract with final submission
    abstract.final = {
      file: {
        originalName: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        storagePath: blobUrl,
        uploadedAt: new Date()
      },
      submittedAt: new Date(),
      displayId: finalDisplayId,
      notes: notes || ''
    }
    
    abstract.status = 'final-submitted'
    await abstract.save()

    // Send confirmation email
    try {
      await EmailService.sendFinalSubmissionConfirmation({
        userId: user._id.toString(),
        email: user.email,
        name: `${user.profile?.firstName || user.firstName || ''} ${user.profile?.lastName || user.lastName || ''}`.trim() || user.email,
        registrationId: user.registration?.registrationId || 'N/A',
        abstractId: abstract.abstractId,
        finalDisplayId,
        title: abstract.title,
        track: abstract.track || 'N/A',
        authors: abstract.authors,
        submittedAt: abstract.final.submittedAt?.toISOString() || new Date().toISOString(),
        fileName: file.name
      })
      
      console.log(`✅ Final submission email sent to ${user.email} for abstract ${abstract.abstractId}`)
    } catch (emailError) {
      console.error('Failed to send final submission email:', emailError)
      // Don't fail the submission if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Final submission uploaded successfully',
      data: {
        abstractId: abstract.abstractId,
        finalDisplayId,
        submittedAt: abstract.final.submittedAt,
        filename: file.name
      }
    })

  } catch (error) {
    console.error('Error in final submission:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
