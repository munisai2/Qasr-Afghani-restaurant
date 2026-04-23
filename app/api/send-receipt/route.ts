import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email, orderId, customerName, customerPhone,
      orderType, tableNumber,
      items, subtotal, tax, total,
      specialRequests, placedAt,
    } = body

    if (!orderId || !customerName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const apiKey    = process.env.RESEND_API_KEY
    const enabled   = process.env.RESEND_ENABLED === 'true'
    const fromAddr  = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const ownerAddr = process.env.OWNER_NOTIFICATION_EMAIL

    if (!enabled || !apiKey || apiKey === 're_your_key_here') {
      console.log('[send-receipt] Email skipped: not configured.')
      return NextResponse.json({ success: true, skipped: true })
    }

    const { Resend } = await import('resend')
    const {
      generateReceiptHTML,
      generateOwnerOrderHTML,
    } = await import('@/lib/emailTemplates')

    const resend = new Resend(apiKey)
    const results: string[] = []

    const isDineIn = orderType === 'dine-in'

    // 1. Send receipt to customer (only if they provided email)
    if (email) {
      const { error: customerErr } = await resend.emails.send({
        from:    `Qasr Afghan <${fromAddr}>`,
        to:      [email],
        subject: `Order Confirmed — ${orderId} | Qasr Afghan`,
        html:    generateReceiptHTML({
          orderId, customerName, orderType: orderType ?? 'pickup',
          tableNumber,
          items, subtotal, tax, total,
          specialRequests, placedAt,
        }),
      })
      if (customerErr) {
        console.warn('[send-receipt] Customer email error:', customerErr)
      } else {
        results.push('customer')
      }
    }

    // 2. Send order notification to owner (always, if configured)
    if (ownerAddr) {
      const typeLabel = isDineIn ? `Dine In (Table ${tableNumber})` : 'Pickup'
      const { error: ownerErr } = await resend.emails.send({
        from:    `Qasr Afghan Orders <${fromAddr}>`,
        to:      [ownerAddr],
        replyTo: email ? [email] : undefined,
        subject: `🔔 New ${typeLabel} Order — ${orderId} | $${Number(total).toFixed(2)}`,
        html:    generateOwnerOrderHTML({
          orderId, customerName,
          customerPhone: customerPhone ?? 'Not provided',
          orderType: orderType ?? 'pickup',
          tableNumber,
          items, subtotal, tax, total,
          specialRequests, placedAt,
        }),
      })
      if (ownerErr) {
        console.warn('[send-receipt] Owner notification error:', ownerErr)
      } else {
        results.push('owner')
      }
    }

    return NextResponse.json({ success: true, sent: results })

  } catch (err) {
    console.error('[send-receipt] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
