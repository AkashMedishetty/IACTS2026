import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Configuration from '@/lib/models/Configuration'
import { conferenceConfig } from '@/config/conference.config'
import { sendEmail } from '@/lib/email/smtp'
import { getRegistrationAcceptanceTemplate } from '@/lib/email/templates'
import EmailHistory from '@/lib/models/EmailHistory'

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const BROCHURE_URL = process.env.BROCHURE_URL || ''

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { recipients, subject } = await request.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ success: false, message: 'No recipients provided' }, { status: 400 })
    }

    await connectDB()

    // Get badge configuration
    const badgeConfig = await Configuration.findOne({
      type: 'badge',
      key: 'badge_config'
    })
    const isBadgeEnabled = badgeConfig && badgeConfig.value && badgeConfig.value.enabled

    const BATCH_SIZE = 5 // Process in small batches since PDF and QR generation is heavy
    let sent = 0
    let failed = 0
    const errors: string[] = []

    console.log(`📧 Resend Registration: starting for ${recipients.length} recipients. Badge Enabled: ${isBadgeEnabled}`)

    // Import QR code generator, BadgeGenerator, InvoiceGenerator dynamically to prevent bundle weight
    const { QRCodeGenerator } = await import('@/lib/utils/qrcode-generator')
    const { InvoiceGenerator } = await import('@/lib/pdf/invoice-generator')
    const { BadgeGenerator } = await import('@/lib/pdf/badge-generator')

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE)

      await Promise.allSettled(batch.map(async (recipient: any) => {
        try {
          const { _id, email } = recipient

          if (!_id) {
            throw new Error('No user ID provided')
          }

          // 1. Fetch full user record with all registration/payment details
          const user = await User.findById(_id)
            .select('profile registration payment email')
            .lean() as any

          if (!user) {
            throw new Error(`User not found in database: ${_id}`)
          }

          const regId = user.registration?.registrationId || `REG-${user._id.toString().substring(18, 24).toUpperCase()}`
          const regName = `${user.profile?.title || ''} ${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim()
          
          // Get registration type label
          const matchedCategory = conferenceConfig.registration.categories.find(
            (c: any) => c.key === (user.registration?.category || user.registration?.type)
          )
          const regTypeLabel = matchedCategory?.label || user.registration?.category || user.registration?.type || 'Delegate'

          // 2. Generate QR code
          const qrCodeBuffer = await QRCodeGenerator.generateSimpleRegistrationQRBuffer(regId)
          const qrCodeDataURL = await QRCodeGenerator.generateSimpleRegistrationQR(regId)

          // 3. Generate Badge PDF (if enabled)
          let badgeBuffer: Buffer | null = null
          if (isBadgeEnabled) {
            try {
              badgeBuffer = await BadgeGenerator.generateBadgePDF({
                user,
                badgeConfig,
                registrationId: regId
              })
            } catch (badgeErr) {
              console.error(`❌ Badge PDF generation failed for ${email}:`, badgeErr)
            }
          }

          // 4. Generate Invoice PDF
          let invoiceBuffer: Buffer | null = null
          try {
            // Reconstruct a standard breakdown for InvoiceGenerator
            const breakdown = user.payment?.breakdown || {
              registration: user.payment?.amount || 0,
              gst: 0,
              workshops: 0,
              accompanyingPersons: 0,
              accommodation: 0,
              discount: 0
            }

            const accompanyingPersonsDetails = user.registration?.accompanyingPersons || []

            const mockUserForInvoice = {
              profile: {
                name: regName,
                email: user.email,
                phone: user.profile?.phone || '',
                address: `${user.profile?.address?.street || ''}, ${user.profile?.address?.city || ''}, ${user.profile?.address?.state || ''} ${user.profile?.address?.pincode || ''}`,
                mciNumber: user.profile?.mciNumber || ''
              },
              email: user.email,
              registration: {
                registrationId: regId,
                type: user.registration?.category || user.registration?.type || 'Delegate',
                tier: 'Standard',
                workshopSelections: user.registration?.workshopSelections || [],
                accompanyingPersons: accompanyingPersonsDetails,
                accommodation: user.registration?.accommodation
              },
              payment: {
                amount: user.payment?.amount || 0,
                status: 'verified',
                method: user.payment?.method || 'Online Payment',
                utr: user.payment?.transactionId || user.payment?.bankTransferUTR || '',
                transactionId: user.payment?.transactionId || user.payment?.bankTransferUTR || '',
                paidAt: user.payment?.paymentDate || new Date().toISOString(),
                paymentDate: user.payment?.paymentDate || new Date().toISOString(),
                breakdown: breakdown
              }
            }

            invoiceBuffer = await InvoiceGenerator.generatePDFFromUser(mockUserForInvoice)
          } catch (invoiceErr) {
            console.error(`❌ Invoice PDF generation failed for ${email}:`, invoiceErr)
          }

          // 5. Build HTML
          const html = getRegistrationAcceptanceTemplate({
            name: regName,
            registrationId: regId,
            registrationType: regTypeLabel,
            email: user.email,
            amount: user.payment?.amount || 0,
            currency: 'INR',
            transactionId: user.payment?.transactionId || user.payment?.bankTransferUTR || '',
            workshopSelections: user.registration?.workshopSelections || [],
            accompanyingPersons: user.registration?.accompanyingPersons?.length || 0,
            accommodation: user.registration?.accommodation,
            qrCodeDataURL,
            brochureUrl: BROCHURE_URL,
            hasBadgeAttached: !!badgeBuffer
          })

          const emailSubject = subject || `Registration Confirmed - Welcome to ${conferenceConfig.shortName}`

          // 6. Setup attachments
          const attachments: any[] = []
          
          // Embed QR code inline
          attachments.push({
            filename: 'qr-code-embedded.png',
            content: qrCodeBuffer,
            contentType: 'image/png',
            cid: 'qr-code-embedded'
          })

          // Attach QR code as file download too
          attachments.push({
            filename: `${regId}-QR.png`,
            content: qrCodeBuffer,
            contentType: 'image/png'
          })

          // Attach Invoice PDF
          if (invoiceBuffer) {
            attachments.push({
              filename: `${regId}-Invoice.pdf`,
              content: invoiceBuffer,
              contentType: 'application/pdf'
            })
          }

          // Attach Badge PDF
          if (badgeBuffer) {
            attachments.push({
              filename: `${regId}-Badge.pdf`,
              content: badgeBuffer,
              contentType: 'application/pdf'
            })
          }

          // 7. Send the email
          await sendEmail({
            to: user.email,
            subject: emailSubject,
            html,
            text: `Dear ${regName}, your registration ID for ${conferenceConfig.shortName} is ${regId}. Please present your QR code at the venue.`,
            attachments,
            userId: _id,
            userName: regName,
            templateName: 'registration-resend',
            category: 'registration'
          })

          sent++
          console.log(`✅ Resent complete registration details to ${user.email} (${regId})`)
        } catch (err: any) {
          failed++
          const msg = `${recipient.email}: ${err?.message || 'Unknown error'}`
          errors.push(msg)
          console.error(`❌ Failed for ${recipient.email}:`, err?.message)
        }
      }))

      // Small delay between batches to avoid overloading SMTP server
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    // Save history
    try {
      await EmailHistory.create({
        subject: subject || `Registration Confirmed - Welcome to ${conferenceConfig.shortName}`,
        template: 'registration-resend',
        content: 'Resent standard registration confirmation email with QR, invoice, and badge.',
        sentAt: new Date(),
        recipientCount: recipients.length,
        successCount: sent,
        failureCount: failed,
        sentBy: (session.user as any).email,
        errorMessages: errors.length > 0 ? errors.slice(0, 20) : undefined
      })
    } catch (e) {
      console.error('Failed to save history:', e)
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: recipients.length,
      successRate: recipients.length > 0 ? ((sent / recipients.length) * 100).toFixed(1) : '0',
      errors: errors.slice(0, 10),
      message: `Sent ${sent} of ${recipients.length} registration emails. Failed: ${failed}`
    })
  } catch (error: any) {
    console.error('Resend registration bulk error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
