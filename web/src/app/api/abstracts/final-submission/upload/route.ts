import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BLOB_TOKEN, BLOB_CONFIGURED, BLOB_NOT_CONFIGURED_MESSAGE } from '@/lib/blob'
import connectDB from '@/lib/mongodb'
import Abstract from '@/lib/models/Abstract'
import { conferenceConfig } from '@/config/conference.config'

/**
 * Signs a direct browser-to-Blob upload for a FINAL presentation.
 *
 * Final presentations are PowerPoint files, routinely larger than the 4.5 MB a
 * Vercel function will accept in a request body, so the file goes straight to
 * Vercel Blob and only its URL reaches /api/abstracts/final-submission.
 *
 * The token is issued only to a signed-in author, for one of their own
 * abstracts that has not been rejected. There is no acceptance step: final
 * submission is open to every submitted abstract.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!BLOB_CONFIGURED) {
    return NextResponse.json({ error: BLOB_NOT_CONFIGURED_MESSAGE }, { status: 503 })
  }
  try {
    const body = (await request.json()) as HandleUploadBody
    const json = await handleUpload({
      body,
      request,
      token: BLOB_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!conferenceConfig.abstracts.finalSubmissionOpen) throw new Error('Final submission is closed')
        const session = await getServerSession(authOptions)
        const userId = (session?.user as any)?.id
        if (!userId) throw new Error('Please sign in to upload your final presentation')

        let abstractId = ''
        try {
          abstractId = JSON.parse(clientPayload || '{}').abstractId || ''
        } catch {
          /* fall through to the check below */
        }
        if (!abstractId) throw new Error('Abstract is required')

        await connectDB()
        const abstract = await Abstract.findById(abstractId).select('userId status')
        if (!abstract || abstract.userId.toString() !== userId) throw new Error('Abstract not found')
        if (abstract.status === 'rejected') throw new Error('This abstract is not eligible for final submission')

        if (!/\.(pptx?|pdf|docx?)$/i.test(pathname)) {
          throw new Error('Upload a PowerPoint, PDF or Word file')
        }
        return {
          // No content-type list: browsers report .pptx inconsistently, which
          // makes the Blob API reject the PUT. The extension check above and
          // the file picker enforce the format instead.
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ abstractId, userId }),
        }
      },
      onUploadCompleted: async () => {
        /* The final-submission route records the upload; nothing to do here. */
      },
    })
    return NextResponse.json(json)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
