import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email, orderId, customerName, type, newValue, reason,
    } = body

    if (!orderId || !customerName || !type || newValue === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const apiKey    = process.env.RESEND_API_KEY
    const enabled   = process.env.RESEND_ENABLED === 'true'
    const fromAddr  = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    if (!enabled || !apiKey || apiKey === 're_your_key_here') {
      console.log('[send-adjustment] Email skipped: not configured.')
      return NextResponse.json({ success: true, skipped: true })
    }

    const { Resend } = await import('resend')
    const { generateAdjustmentHTML } = await import('@/lib/emailTemplates')

    const resend = new Resend(apiKey)

    if (email) {
      const { error } = await resend.emails.send({
        from:    `Qasr Afghan <${fromAddr}>`,
        to:      [email],
        subject: `Update regarding your order ${orderId} | Qasr Afghan`,
        html:    generateAdjustmentHTML({ orderId, customerName, type, newValue, reason }),
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
