import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
import { fetchRestaurantInfo, fetchActivePromoCodes } from '@/lib/fetchData'

export async function GET() {
  try {
    const [info, activePromos] = await Promise.all([
      fetchRestaurantInfo(),
      fetchActivePromoCodes()
    ])

    return NextResponse.json({
      restaurantStatus: info?.restaurantStatus || 'open',
      phone:            info?.phone || '',
      openingHours:     info?.openingHours || [],
      busyExtraMinutes: info?.busyExtraMinutes || 0,
      maxPartySize:        info?.maxPartySize || 20,
      totalTables:         info?.totalTables || 16,
      activePromos:        activePromos || [],
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch restaurant info' }, { status: 500 })
  }
}
