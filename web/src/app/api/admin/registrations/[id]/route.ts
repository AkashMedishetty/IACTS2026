import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import  connectDB  from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userRole = (session.user as any)?.role
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const { id } = await params
    const body = await request.json()

    const CONFIRMED = ['paid', 'confirmed']

    // Capture the status BEFORE writing, so a transition can be detected
    // regardless of which shape the admin UI sends.
    const before = await User.findById(id).select('registration.status registration.paymentConfirmationEmail')
    if (!before) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 })
    }
    const previousStatus = before.registration?.status
    const alreadyNotified = before.registration?.paymentConfirmationEmail?.sent === true

    const isStatusOnly = body.status && Object.keys(body).length === 1
    const updateData: any = isStatusOnly ? { 'registration.status': body.status } : { ...body }
    const nextStatus = isStatusOnly ? body.status : (body['registration.status'] ?? body?.registration?.status ?? previousStatus)

    if (CONFIRMED.includes(nextStatus) && !CONFIRMED.includes(previousStatus)) {
      updateData[isStatusOnly ? 'registration.paymentDate' : 'registration.paymentDate'] = new Date().toISOString()
    }

    const user = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true })
    if (!user) {
      return NextResponse.json({ success: false, message: "Registration not found" }, { status: 404 })
    }

    // Payment just confirmed -> send the entry pass with the QR code.
    // Best-effort: a mail failure must never undo the status change, and it is
    // recorded on the record so admin can see and retry it.
    let paymentEmailSent = false
    let paymentEmailError: string | null = null
    if (CONFIRMED.includes(nextStatus) && !CONFIRMED.includes(previousStatus) && !alreadyNotified) {
      try {
        const { EmailService } = await import('@/lib/email/service')
        const { conferenceConfig } = await import('@/config/conference.config')
        const label = conferenceConfig.registration.categories
          .find((c: any) => c.key === user.registration.type)?.label || user.registration.type

        const result: any = await EmailService.sendRegistrationDetailsWithQR({
          userId: user._id.toString(),
          email: user.email,
          name: `${user.profile.firstName} ${user.profile.lastName}`.trim(),
          registrationId: user.registration.registrationId,
          registrationType: label,
        })
        if (result && result.success === false) throw new Error(result.error || 'Email provider reported a failure')

        paymentEmailSent = true
        await User.updateOne({ _id: user._id }, {
          $set: { 'registration.paymentConfirmationEmail': { sent: true, sentAt: new Date(), attemptedAt: new Date() } },
        })
      } catch (mailError) {
        paymentEmailError = (mailError as Error)?.message || 'Unknown email error'
        console.error('⚠️ Payment confirmation email failed (status change kept):', paymentEmailError)
        await User.updateOne({ _id: user._id }, {
          $set: { 'registration.paymentConfirmationEmail': { sent: false, attemptedAt: new Date(), error: paymentEmailError } },
        }).catch(() => {})
      }
    }

    return NextResponse.json({
      success: true,
      message: isStatusOnly ? "Status updated successfully" : "Registration updated successfully",
      data: user,
      paymentEmailSent,
      paymentEmailError,
    })

  } catch (error) {
    console.error("Update registration error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userRole = (session.user as any)?.role
    if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const { id } = await params

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { 'registration.status': 'cancelled' } },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully",
      data: user
    })

  } catch (error) {
    console.error("Cancel registration error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}