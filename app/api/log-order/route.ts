import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const order = await req.json()

    const divider = '═'.repeat(50)
    console.log(`\n${divider}`)
    console.log(`🔔  NEW ORDER RECEIVED`)
    console.log(divider)
    console.log(`Order ID  : ${order.orderId}`)
    console.log(`Customer  : ${order.customerName}`)
    console.log(`Phone     : ${order.customerPhone ?? 'Not provided'}`)
    console.log(`Type      : PICKUP`)
    console.log(`Placed    : ${new Date(order.placedAt).toLocaleString()}`)
    console.log(``)
    console.log(`ITEMS:`)
    order.items?.forEach((item: any) => {
      console.log(`  ${item.quantity}x  ${item.name.padEnd(30)} $${(item.price * item.quantity).toFixed(2)}`)
    })
    if (order.specialRequests) {
      console.log(``)
      console.log(`NOTES: ${order.specialRequests}`)
    }
    console.log(``)
    console.log(`Subtotal  : $${order.subtotal?.toFixed(2)}`)
    console.log(`Tax       : $${order.tax?.toFixed(2)}`)
    console.log(`TOTAL     : $${order.total?.toFixed(2)}`)
    console.log(`${divider}\n`)

    return NextResponse.json({ logged: true })
  } catch (err) {
    // Never fail — logging is non-critical
    return NextResponse.json({ logged: false })
  }
}
