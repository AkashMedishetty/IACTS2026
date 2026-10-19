import { NextResponse } from 'next/server'

/**
 * Retired. This marked an abstract "final-submitted" without any file and only
 * after acceptance. Final submission now uploads the presentation to Blob from
 * the abstracts dashboard (/api/abstracts/final-submission), open to every
 * submitted abstract.
 */
export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Please upload your final presentation from the Abstracts section of your dashboard.' },
    { status: 410 },
  )
}
