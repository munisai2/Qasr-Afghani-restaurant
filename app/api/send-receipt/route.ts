import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateReceiptHTML } from '@/lib/emailTemplates'

// Called by the kitchen app when staff taps "Accept Order".
// NOT called by the website checkout — that auto-email was removed.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email, orderId, customerName, customerPhone,
      orderType, tableNumber,
      items, subtotal, tax, total,
      specialRequests, placedAt, logoUrl, estimatedTime,
      discountAmount, adjustmentReason,
    } = body

    if (!orderId || !customerName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const apiKey   = process.env.RESEND_API_KEY
    const enabled  = process.env.RESEND_ENABLED === 'true'
    const fromAddr = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    if (!enabled || !apiKey || apiKey === 're_your_key_here') {
      console.log('[send-receipt] Email skipped: not configured.')
      return NextResponse.json({ success: true, skipped: true })
    }

    const resend = new Resend(apiKey)

    if (email) {
      const { error: customerErr } = await resend.emails.send({
        from:    `Qasr Afghan <${fromAddr}>`,
        to:      [email],
        subject: `Order Confirmed — ${orderId} | Qasr Afghan`,
        html:    generateReceiptHTML({
          orderId, customerName, orderType: orderType ?? 'pickup',
          tableNumber,
          items, subtotal, tax, total,
          specialRequests, placedAt, logoUrl, estimatedTime,
          discountAmount, adjustmentReason,
        }),
      })
      if (customerErr) {
        console.warn('[send-receipt] Customer email error:', customerErr)
      } else {
        console.log(`[send-receipt] Receipt sent to ${email}`)
      }
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[send-receipt] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
