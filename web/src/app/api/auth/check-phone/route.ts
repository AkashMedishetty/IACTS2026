import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { findDelegateByPhone, phoneKey } from '@/lib/duplicatePhone'

/**
 * Lets the registration form say "this mobile is already registered" while the
 * delegate is still on the field. Reveals only yes/no, never whose number it is.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, email } = await request.json().catch(() => ({}))
    if (!phoneKey(phone)) {
      return NextResponse.json({ success: false, message: 'A 10-digit mobile number is required' }, { status: 400 })
    }
    await connectDB()
    const taken = await findDelegateByPhone(phone, typeof email === 'string' ? email : undefined)
    return NextResponse.json({ success: true, available: !taken })
  } catch (error) {
    console.error('Phone check error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
