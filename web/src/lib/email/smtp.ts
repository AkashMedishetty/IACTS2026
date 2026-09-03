import nodemailer from 'nodemailer'
import { conferenceConfig } from '../../config/conference.config'
import connectDB from '../mongodb'

// Cache a single pooled transporter per server process (per Vercel invocation).
// This avoids a fresh SMTP connection + verify() handshake on every email,
// which was the main throughput bottleneck for bulk sends.
let cachedTransporter: any = null

/**
 * A transport that only logs. Silently pretending to send is dangerous: the app
 * records "sent" while nothing is delivered. So this is refused in production
 * unless explicitly opted into with EMAIL_SIMULATE=true.
 */
function simulationTransport(reason: string) {
  const allowed = process.env.NODE_ENV !== 'production' || process.env.EMAIL_SIMULATE === 'true'
  if (!allowed) {
    throw new Error(
      `Refusing to simulate email in production (${reason}). ` +
      `Fix SMTP_HOST/SMTP_USER/SMTP_PASS, or set EMAIL_SIMULATE=true to allow logging instead of sending.`,
    )
  }
  console.warn(`\n🚨 EMAIL SIMULATION ACTIVE — nothing is being delivered (${reason}).\n`)
  return {
    simulated: true,
    sendMail: async (mailOptions: any) => {
      console.warn('📧 SIMULATED (not sent) ->', mailOptions.to, '|', mailOptions.subject)
      return { messageId: 'simulated-' + Date.now(), simulated: true }
    },
    verify: async () => true,
  }
}


// Create reusable transporter object using SMTP
export async function createSMTPTransporter() {
  // Reuse the pooled transporter if we've already created a real one in this process
  if (cachedTransporter) return cachedTransporter
  // Always use environment variables for SMTP configuration
  // Check if SMTP is configured
  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS
  
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('SMTP configuration incomplete. Email functionality will be simulated.')
    console.log('Required variables: SMTP_HOST, SMTP_USER, SMTP_PASS')
    console.log('Current values:', { 
      host: smtpHost ? 'SET' : 'NOT SET', 
      user: smtpUser ? 'SET' : 'NOT SET', 
      pass: smtpPass ? 'SET' : 'NOT SET' 
    })
    
    return simulationTransport('SMTP is not configured')
  }

  // SMTP configuration — pooled connections for fast bulk sending
  const smtpConfig = {
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    },
    // Connection pooling: reuse a small number of connections across many messages
    pool: true,
    maxConnections: parseInt(process.env.SMTP_MAX_CONNECTIONS || '5'),
    maxMessages: parseInt(process.env.SMTP_MAX_MESSAGES || '100'),
    // Gentle rate limit to stay within provider limits (messages per rateDelta ms)
    rateDelta: 1000,
    rateLimit: parseInt(process.env.SMTP_RATE_LIMIT || '5'),
  }

  // Create transporter
  const transporter = nodemailer.createTransport(smtpConfig)

  // Verify connection configuration once, then cache for reuse
  try {
    await transporter.verify()
    console.log('✅ SMTP server is ready to take our messages (pooled)')
    cachedTransporter = transporter
    return transporter
  } catch (error) {
    console.error('❌ SMTP connection failed:', (error as Error)?.message || error)
    return simulationTransport(`SMTP error: ${(error as Error)?.message || 'unknown'}`)
  }
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments = [],
  // Optional tracking metadata
  userId,
  userName,
  templateName,
  category
}: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  attachments?: any[]
  // Optional tracking metadata
  userId?: string
  userName?: string
  templateName?: string
  category?: 'registration' | 'payment' | 'abstract' | 'system' | 'reminder' | 'custom' | 'sponsor'
}) {
  try {
    const transporter = await createSMTPTransporter()
    
    // Use environment variables for SMTP settings, fallback to conferenceConfig
    const fromEmail = process.env.SMTP_USER || process.env.EMAIL_USER || conferenceConfig.contact.email
    const fromName = process.env.APP_NAME || conferenceConfig.email.fromName

    console.log(`📧 Sending email using SMTP: ${fromEmail}`)

    const mailOptions = {
      from: {
        name: fromName,
        address: fromEmail
      },
      to: Array.isArray(to) ? to.join(', ') : to,
      replyTo: fromEmail,
      subject,
      html,
      text,
      attachments
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)

    // Save to EmailHistory for tracking
    try {
      await connectDB()
      const EmailHistory = (await import('../models/EmailHistory')).default
      
      const recipientEmail = Array.isArray(to) ? to[0] : to
      const attachmentMeta = attachments?.map((a: any) => ({
        filename: a.filename || 'attachment',
        contentType: a.contentType || 'application/octet-stream',
        size: a.content?.length || 0
      }))

      await EmailHistory.create({
        recipient: {
          userId: userId || undefined,
          email: recipientEmail.toLowerCase(),
          name: userName || recipientEmail.split('@')[0]
        },
        subject,
        htmlContent: html || '',
        plainTextContent: text || '',
        templateName: templateName || 'direct-email',
        templateData: {},
        category: category || 'system',
        attachments: attachmentMeta,
        status: 'sent',
        messageId: result.messageId,
        sentAt: new Date()
      })
      console.log('📝 Email recorded to history')
    } catch (historyError) {
      console.warn('⚠️ Failed to save email to history (non-blocking):', historyError)
      // Don't fail the email send if history save fails
    }

    return {
      success: true,
      messageId: result.messageId
    }
  } catch (error) {
    console.error('Email sending error:', error)
    
    // Try to save failed email to history
    try {
      await connectDB()
      const EmailHistory = (await import('../models/EmailHistory')).default
      
      const recipientEmail = Array.isArray(to) ? to[0] : to
      await EmailHistory.create({
        recipient: {
          userId: userId || undefined,
          email: recipientEmail.toLowerCase(),
          name: userName || recipientEmail.split('@')[0]
        },
        subject,
        htmlContent: html || '',
        plainTextContent: text || '',
        templateName: templateName || 'direct-email',
        templateData: {},
        category: category || 'system',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        sentAt: new Date()
      })
    } catch (historyError) {
      console.warn('⚠️ Failed to save failed email to history:', historyError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Send bulk emails with rate limiting
export async function sendBulkEmails({
  recipients,
  subject,
  html,
  text,
  batchSize = 10,
  delay = 1000
}: {
  recipients: string[]
  subject: string
  html?: string
  text?: string
  batchSize?: number
  delay?: number
}) {
  const results = []
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)
    
    const batchPromises = batch.map(email => 
      sendEmail({ to: email, subject, html, text })
    )
    
    const batchResults = await Promise.allSettled(batchPromises)
    results.push(...batchResults)
    
    // Add delay between batches to avoid rate limiting
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return results
}