import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { BLOB_TOKEN } from '@/lib/blob'
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

// This route handles client-side uploads to Vercel Blob.
// Files go directly from the browser to Vercel Blob (bypasses the 4.5MB
// serverless body limit). handleUpload signs a short-lived client token using
// the read-write token (OIDC is NOT accepted for client uploads).

// --- Debug helper: summarise the resolved token WITHOUT leaking the secret ---
function blobDiagnostics() {
  const t = BLOB_TOKEN
  const isRw = !!t && t.startsWith('vercel_blob_rw_')
  // token format: vercel_blob_rw_<storeId>_<secret>
  const storeIdFromToken = isRw ? t!.replace('vercel_blob_rw_', '').split('_')[0] : null
  const envStoreId = (process.env.BLOB_STORE_ID || '').replace(/^store_/, '')
  return {
    tokenPresent: !!t,
    tokenLooksValid: isRw,
    tokenLength: t ? t.length : 0,
    storeIdFromToken,
    BLOB_STORE_ID: process.env.BLOB_STORE_ID || null,
    storeMatches: !!storeIdFromToken && storeIdFromToken === envStoreId,
    blobEnvVarNames: Object.keys(process.env).filter((k) => k.toUpperCase().includes('BLOB')),
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody

    console.log('[blob-upload] incoming request', {
      bodyType: (body as { type?: string })?.type,
      diagnostics: blobDiagnostics(),
    })

    const jsonResponse = await handleUpload({
      body,
      request,
      token: BLOB_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log('[blob-upload] onBeforeGenerateToken', { pathname, clientPayload })

        let registrationId = ''
        if (clientPayload) {
          try {
            const payload = JSON.parse(clientPayload)
            registrationId = payload.registrationId || ''
          } catch {
            registrationId = clientPayload
          }
        }

        if (registrationId) {
          await connectDB()
          const user = await User.findOne({
            'registration.registrationId': registrationId,
          })
          if (!user) {
            console.warn('[blob-upload] invalid registrationId', registrationId)
            throw new Error('Invalid registration ID')
          }
        }

        console.log('[blob-upload] generating client token', { registrationId, pathname })

        return {
          // No content-type restriction: browsers report .docx inconsistently
          // (often application/octet-stream or empty), which made the Blob API
          // reject the PUT with a 400. Word-only is enforced on the client file
          // picker instead.
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            registrationId,
            uploadedAt: new Date().toISOString(),
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Won't fire on localhost (Vercel can't reach your machine)
        console.log('[blob-upload] ✅ upload completed:', blob.url, tokenPayload)
      },
    })

    console.log('[blob-upload] handleUpload OK', JSON.stringify(jsonResponse).slice(0, 300))
    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('[blob-upload] ❌ ERROR:', error, '| diagnostics:', blobDiagnostics())
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
