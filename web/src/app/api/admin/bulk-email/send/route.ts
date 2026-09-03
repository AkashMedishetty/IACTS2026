import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { EmailService } from '@/lib/email/service'
import EmailHistory from '@/lib/models/EmailHistory'

// Increase timeout for bulk email sending (5 minutes)
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const {
      subject,
      content,
      recipients,
      template,
      startIndex = 0,          // resume position (client passes nextIndex on subsequent calls)
      skipAlreadySent = true,  // skip anyone already emailed this subject recently (idempotent re-runs)
    } = await request.json()

    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    await connectDB()

    let sent = 0
    let failed = 0
    let skipped = 0
    const errors: string[] = []
    const totalRecipients = recipients.length

    // Time budget: stop before Vercel's 300s hard limit and let the client resume.
    const TIME_BUDGET_MS = 230 * 1000
    const startedAt = Date.now()

    console.log(`🚀 Bulk email send: ${totalRecipients} recipients, starting at index ${startIndex}`)
    console.log(`📧 Template: ${template || 'custom'}, Subject: ${subject}`)

    // Build a skip-set of emails already sent for this subject (makes re-runs safe, avoids duplicates)
    let alreadySentSet = new Set<string>()
    if (skipAlreadySent) {
      try {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days
        const prior = await EmailHistory.find({
          subject,
          status: 'sent',
          sentAt: { $gte: since },
        }).select('recipient.email').lean()
        alreadySentSet = new Set(
          prior
            .map((p: any) => (p?.recipient?.email || '').toLowerCase())
            .filter(Boolean)
        )
        console.log(`↩️  ${alreadySentSet.size} recipients already sent this subject — will skip`)
      } catch (e) {
        console.warn('Could not load already-sent set (continuing without skip):', e)
      }
    }

    const BATCH_SIZE = 10 // emails processed in parallel per batch
    let index = Math.max(0, startIndex)
    let timedOut = false

    while (index < recipients.length) {
      // Stop if we're about to exceed the time budget — client will resume from `index`
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        timedOut = true
        console.log(`⏱️  Time budget reached at index ${index}/${recipients.length} — returning for resume`)
        break
      }

      const batch = recipients.slice(index, index + BATCH_SIZE)
      const batchStart = Date.now()

      const batchResults = await Promise.allSettled(
        batch.map(async (recipient: any) => {
          const email = (recipient.email || '').toLowerCase()
          // Skip if already emailed this subject
          if (email && alreadySentSet.has(email)) {
            return { skipped: true, email }
          }
          try {
            const personalizedContent = content
              .replace(/{name}/g, recipient.name || '')
              .replace(/{registrationId}/g, recipient.registrationId || '')
              .replace(/{category}/g, recipient.category || '')
              .replace(/{status}/g, recipient.status || '')

            await EmailService.sendBulkTemplateEmail({
              to: recipient.email,
              subject,
              template: template || 'custom',
              userData: {
                name: recipient.name,
                registrationId: recipient.registrationId,
                category: recipient.category,
                userId: recipient._id,
                workshop: recipient.workshop
              },
              content: personalizedContent
            })
            if (email) alreadySentSet.add(email) // guard against dupes within this run
            return { success: true, email: recipient.email }
          } catch (error) {
            return {
              success: false,
              email: recipient.email,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      )

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && (result.value as any).skipped) {
          skipped++
        } else if (result.status === 'fulfilled' && (result.value as any).success) {
          sent++
        } else {
          failed++
          const errorMsg = result.status === 'fulfilled'
            ? `${(result.value as any).email}: ${(result.value as any).error}`
            : 'Promise rejected'
          errors.push(errorMsg)
        }
      })

      index += batch.length
      console.log(`✅ Processed ${index}/${recipients.length} in ${Date.now() - batchStart}ms — Sent: ${sent}, Skipped: ${skipped}, Failed: ${failed}`)

      // Small delay between batches to ease provider rate limits
      if (index < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    const done = index >= recipients.length

    // Save a summary row to email history for this chunk
    try {
      await EmailHistory.create({
        subject,
        template,
        content: content.substring(0, 500),
        sentAt: new Date(),
        recipientCount: recipients.length,
        successCount: sent,
        failureCount: failed,
        sentBy: (session.user as any).email,
        errorMessages: errors.length > 0 ? errors.slice(0, 20) : undefined
      })
    } catch (error) {
      console.error('Failed to save email history summary:', error)
    }

    const response = {
      success: true,
      sent,
      failed,
      skipped,
      total: totalRecipients,
      processedUpTo: index,
      nextIndex: done ? null : index,
      done,
      timedOut,
      successRate: totalRecipients > 0 ? (((sent) / totalRecipients) * 100).toFixed(2) : '0',
      errors: errors.length > 0 ? errors.slice(0, 10) : [],
      message: done
        ? `Completed. Sent ${sent}, skipped ${skipped} (already sent), failed ${failed} of ${totalRecipients}.`
        : `Chunk done — sent ${sent}, skipped ${skipped}, failed ${failed}. Resume from index ${index}.`
    }

    console.log(`📊 Result:`, response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Bulk email send error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to send emails',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
