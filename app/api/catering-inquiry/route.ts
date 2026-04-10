import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firstName, lastName, email, phone,
      selectedPlan, eventDate, guestCount, message,
      turnstileToken,
    } = body

    // Validate Turnstile token
    const tokenValid = await verifyTurnstileToken(turnstileToken)
    if (!tokenValid) {
      return NextResponse.json(
        { error: 'Bot verification failed. Please try again.' },
        { status: 403 }
      )
    }

    const apiKey     = process.env.RESEND_API_KEY
    const enabled    = process.env.RESEND_ENABLED === 'true'
    const fromAddr   = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const ownerAddr  = process.env.OWNER_NOTIFICATION_EMAIL

    // Log to server regardless of email config
    console.log(`[catering-inquiry] New inquiry from ${firstName} ${lastName}`)
    console.log(`  Email: ${email} | Phone: ${phone}`)
    console.log(`  Plan: ${selectedPlan ?? 'Not specified'}`)
    console.log(`  Date: ${eventDate} | Guests: ${guestCount}`)
    console.log(`  Message: ${message}`)

    if (enabled && apiKey && apiKey !== 're_your_key_here' && ownerAddr) {
      const { Resend } = await import('resend')
      const { generateOwnerCateringHTML } = await import('@/lib/emailTemplates')
      const resend = new Resend(apiKey)

      await resend.emails.send({
        from:    `Qasr Afghan Catering <${fromAddr}>`,
        to:      [ownerAddr],
        replyTo: [email],
        subject: `🍽️ Catering Inquiry — ${firstName} ${lastName} | ${guestCount} guests`,
        html:    generateOwnerCateringHTML({
          customerName: `${firstName} ${lastName}`,
          email, phone,
          selectedPlan,
          eventDate,
          guestCount: Number(guestCount),
          message,
          submittedAt: new Date().toISOString(),
        }),
      }).catch(err => console.warn('[catering-inquiry] Email error:', err))
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[catering-inquiry] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function verifyTurnstileToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || secret === 'your_secret_here') return true
  if (!token) return false

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    }
  )
  const data = await res.json()
  return data.success === true
}
