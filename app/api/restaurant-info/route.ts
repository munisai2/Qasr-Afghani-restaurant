import { NextResponse } from 'next/server'
import { fetchRestaurantInfo } from '@/lib/fetchData'

export async function GET() {
  try {
    const info = await fetchRestaurantInfo()
    return NextResponse.json({
      restaurantStatus: info?.restaurantStatus || 'open',
      phone:            info?.phone || '',
      openingHours:     info?.openingHours || [],
      busyExtraMinutes: info?.busyExtraMinutes || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch restaurant info' }, { status: 500 })
  }
}
