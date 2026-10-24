import { NextRequest, NextResponse } from 'next/server'
import { getCheckInStaff } from '@/lib/checkin'
import { runSpotImport } from '@/lib/spotImport'

export const dynamic = 'force-dynamic'

/** Badge desk export upload — see runSpotImport. dryRun=1 reports without writing. */
export async function POST(request: NextRequest) {
  const staff = await getCheckInStaff()
  if (!staff || staff.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
  }

  try {
    const form = await request.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 })

    const result = await runSpotImport(Buffer.from(await file.arrayBuffer()), {
      dryRun: form.get('dryRun') === '1',
      createAllUnmatched: form.get('createAllUnmatched') === '1',
    })
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('Spot import error:', error)
    return NextResponse.json({ success: false, message: error?.message || 'Import failed' }, { status: 500 })
  }
}
