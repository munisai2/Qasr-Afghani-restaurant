/**
 * Archives completed/cancelled orders older than 90 days.
 * Orders are NEVER deleted — just tagged with archivedAt.
 *
 * Called weekly via Vercel cron (see vercel.json):
 *   { "path": "/api/archive-old-orders", "schedule": "0 2 * * 1" }
 *
 * Or call manually: GET /api/archive-old-orders
 */
import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity.client'

export async function GET() {
  try {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const oldOrders: { _id: string }[] = await writeClient.fetch(
      `*[_type == "order" &&
         status in ["completed", "cancelled"] &&
         placedAt < $cutoff &&
         !defined(archivedAt)] { _id }`,
      { cutoff: ninetyDaysAgo.toISOString() }
    )

    if (oldOrders.length === 0) {
      return NextResponse.json({ archived: 0, message: 'No orders to archive' })
    }

    const transaction = writeClient.transaction()
    oldOrders.forEach(({ _id }) => {
      transaction.patch(_id, p => p.set({ archivedAt: new Date().toISOString() }))
    })
    await transaction.commit()

    console.log(`[archive-old-orders] Archived ${oldOrders.length} orders`)
    return NextResponse.json({
      archived: oldOrders.length,
      message:  `Archived ${oldOrders.length} old orders`,
    })
  } catch (err) {
    console.error('[archive-old-orders] Error:', err)
    return NextResponse.json({ error: 'Failed to archive orders' }, { status: 500 })
  }
}
