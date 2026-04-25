import { NextResponse } from 'next/server'

export async function GET() {
  const topic = process.env.NTFY_TOPIC
  const server = process.env.NTFY_SERVER
  const enabled = process.env.NTFY_ENABLED === 'true'

  if (!enabled || !topic || !server) {
    return NextResponse.json({ 
      status: 'disabled or missing env vars',
      topic,
      server,
      enabled 
    })
  }

  try {
    const response = await fetch(`${server}/${topic}`, {
      method: 'POST',
      body: 'Test notification from Qasr Afghan Website',
      headers: {
        'Title': 'Qasr Afghan Notification Test',
        'Priority': 'default',
        'Tags': 'white_check_mark'
      }
    })

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'ntfy.sh test sent successfully!' })
    } else {
      const errText = await response.text()
      return NextResponse.json({ success: false, error: errText }, { status: response.status })
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
