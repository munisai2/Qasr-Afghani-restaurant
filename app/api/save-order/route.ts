import { NextRequest, NextResponse } from 'next/server'
import { writeClient } from '@/sanity.client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      orderId, customerName, customerPhone, customerEmail,
      orderType, tableNumber, guestCount,
      items, subtotal, tax, total, specialRequests, placedAt,
      estimatedTime, scheduledTime, promoCode, promoDiscount,
      includeUtensils,
    } = body

    if (!orderId || !customerName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (!process.env.SANITY_API_WRITE_TOKEN) {
      console.warn('[save-order] No write token — order not saved to Sanity')
      return NextResponse.json({ success: true, skipped: true })
    }

    const doc = {
      _type:           'order',
      _id:             `order-${orderId}`,
      orderId,
      status:          scheduledTime ? 'scheduled' : 'new',
      customerName,
      customerPhone:   customerPhone ?? '',
      customerEmail:   customerEmail ?? '',
      orderType:       orderType ?? 'pickup',
      tableNumber:     (orderType === 'dine-in' || orderType === 'reservation') ? (tableNumber ?? '') : '',
      guestCount:      (orderType === 'dine-in' || orderType === 'reservation') ? Number(guestCount ?? 1) : undefined,
      estimatedTime:   Number(estimatedTime ?? 25),
      scheduledTime:   (orderType === 'pickup-scheduled') ? scheduledTime : null,
      reservationTime: (orderType === 'reservation') ? scheduledTime : null,
      promoCode:       promoCode ?? null,
      promoDiscount:   promoDiscount ? Number(promoDiscount) : undefined,
      items:           (items ?? []).map((item: any, i: number) => ({
        _type:    'orderItem',
        _key:     `item-${i}`,
        name:     item.name,
        quantity: item.quantity,
        price:    item.price,
      })),
      subtotal: Number(subtotal),
      tax:      Number(tax),
      total:    Number(total),
      specialRequests: specialRequests ?? '',
      includeUtensils: includeUtensils ?? false,
      placedAt:  placedAt ?? new Date().toISOString(),
      notes:    '',
      kitchenMessage: body.kitchenMessage ?? '',
    }

    await writeClient.createOrReplace(doc)
    console.log(`[save-order] Order ${orderId} saved to Sanity`)

    return NextResponse.json({ success: true, orderId })

  } catch (err) {
    console.error('[save-order] Error saving to Sanity:', err)
    return NextResponse.json({ success: true, warning: 'Save failed' })
  }
}
