import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateAdjustmentHTML } from '@/lib/emailTemplates'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email, orderId, customerName, type, newValue, reason, logoUrl, discountAmount
    } = body

    // 'ready' and 'reservation_reminder' don't require newValue
    const needsValue = !['ready'].includes(type)
    if (!orderId || !customerName || !type || (needsValue && newValue === undefined)) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const apiKey    = process.env.RESEND_API_KEY
    const enabled   = process.env.RESEND_ENABLED === 'true'
    const fromAddr  = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    if (!enabled || !apiKey || apiKey === 're_your_key_here') {
      console.log('[send-adjustment] Email skipped: not configured.')
      return NextResponse.json({ success: true, skipped: true })
    }

    const resend = new Resend(apiKey)

    if (email) {
      let subject = `Update regarding your order ${orderId} | Qasr Afghan`
      if (type === 'ready') subject = 'Your order is ready for pickup! | Qasr Afghan'
      if (type === 'reservation_reminder') subject = 'Your reservation is coming up! | Qasr Afghan'

      const { error } = await resend.emails.send({
        from:    `Qasr Afghan <${fromAddr}>`,
        to:      [email],
        subject,
        html:    generateAdjustmentHTML({ orderId, customerName, type: type as any,
          newValue: newValue || '',
          reason, logoUrl, discountAmount
        }),
      })

      if (error) {
        console.warn('[send-adjustment] email error:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-adjustment] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
