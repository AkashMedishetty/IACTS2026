import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Logs a final-presentation upload that failed in the browser. The upload goes
 * straight from the browser to Vercel Blob, so without this a failure never
 * reaches the server and is invisible in the Vercel logs.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json().catch(() => ({}))
    const clip = (v: unknown, n = 300) => String(v ?? '').slice(0, n)
    console.error('[final-submission] upload failed', JSON.stringify({
      user: clip(session?.user?.email, 120) || 'not signed in',
      stage: clip(body.stage, 20),
      message: clip(body.message, 500),
      abstractId: clip(body.abstractId, 60),
      fileName: clip(body.fileName, 200),
      fileSizeMB: Math.round((Number(body.fileSizeBytes) || 0) / 1e5) / 10,
      userAgent: clip(body.userAgent, 200),
    }))
  } catch { /* never fail the caller */ }
  return NextResponse.json({ ok: true })
}
