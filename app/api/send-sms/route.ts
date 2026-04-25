import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { to, type, data } = body

    if (!to || !type || !data) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    let message = ''

    if (type === 'received') {
      if (data.orderType === 'dine-in') {
        message = `Hi ${data.customerName}! Your dine-in order #${data.orderId} at Qasr Afghan is placed. Table ${data.tableNumber} — our team will bring it to you! Call: 716-260-1613`
      } else {
        message = `Hi ${data.customerName}! We received your order #${data.orderId} at Qasr Afghan. Estimated ready time: ~${data.estimatedTime} mins. We will SMS you when ready! Call: 716-260-1613`
      }
    } else if (type === 'scheduled') {
      const date = new Date(data.scheduledTime)
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      const scheduledDisplay = `${formattedDate} at ${formattedTime}`
      
      if (data.orderType === 'reservation') {
        message = `Hi ${data.customerName}! Your dine-in reservation #${data.orderId} at Qasr Afghan is confirmed for ${data.guestCount} guests on ${scheduledDisplay}. See you then! Call: 716-260-1613`
      } else {
        message = `Hi ${data.customerName}! Your scheduled pickup order #${data.orderId} at Qasr Afghan is confirmed for ${scheduledDisplay}. We will prepare it fresh and SMS you when ready! Call: 716-260-1613`
      }
    } else if (type === 'ready') {
      message = `Hi ${data.customerName}! Your order #${data.orderId} at Qasr Afghan is READY for pickup! 🥡 See you soon. Call: 716-260-1613`
    }

    // ── SMS PROVIDER INTEGRATION ──
    // Since we don't have Twilio/Vonage keys yet, we log to console
    // and return success. This allows the frontend flow to work.
    console.log('-------------------------------------------')
    console.log(`[SMS OUTGOING] To: ${to}`)
    console.log(`[SMS CONTENT]  ${message}`)
    console.log('-------------------------------------------')

    return NextResponse.json({ success: true, message: 'SMS sent (logged)' })
  } catch (err) {
    console.error('[send-sms] Error:', err)
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 })
  }
}
