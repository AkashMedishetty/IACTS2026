import User from '@/lib/models/User'

/** Statuses that mean the delegate is in: nothing left to pay or approve. */
export const SETTLED_STATUSES = ['paid', 'confirmed']

/**
 * Send the confirmation with the QR entry pass, once, and record the outcome
 * on the registration.
 *
 * Until 7 October 2026 this email went out ONLY when an admin changed a
 * registration to paid. A complimentary or faculty registration is created
 * already paid, so that change never happened and those delegates received
 * the "application received" email and nothing else. Every path that creates
 * a registration already settled must call this.
 *
 * Best-effort: a mail failure never undoes the registration; it is stored on
 * the record (registration.paymentConfirmationEmail) so the admin can retry.
 */
export async function sendConfirmationWithQR(user: any): Promise<{ sent: boolean; error: string | null }> {
  if (user?.registration?.paymentConfirmationEmail?.sent === true) return { sent: false, error: null }
  try {
    const { EmailService } = await import('@/lib/email/service')
    const { conferenceConfig } = await import('@/config/conference.config')
    const type = user.registration.type
    const label =
      conferenceConfig.registration.categories.find((c: any) => c.key === type)?.label ||
      (type === 'faculty' ? 'Faculty' : type)

    const result: any = await EmailService.sendRegistrationDetailsWithQR({
      userId: user._id.toString(),
      email: user.email,
      name: `${user.profile.firstName} ${user.profile.lastName || ''}`.trim(),
      registrationId: user.registration.registrationId,
      registrationType: label,
    })
    // sendEmail reports failure by return value, not by throwing.
    if (result && result.success === false) throw new Error(result.error || 'Email provider reported a failure')

    await User.updateOne(
      { _id: user._id },
      { $set: { 'registration.paymentConfirmationEmail': { sent: true, sentAt: new Date(), attemptedAt: new Date() } } },
    )
    return { sent: true, error: null }
  } catch (e) {
    const error = (e as Error)?.message || 'Unknown email error'
    console.error('⚠️ Confirmation (QR) email failed, registration kept:', error)
    await User.updateOne(
      { _id: user._id },
      { $set: { 'registration.paymentConfirmationEmail': { sent: false, attemptedAt: new Date(), error } } },
    ).catch(() => {})
    return { sent: false, error }
  }
}
