/**
 * Export all orders to CSV (Excel compatible)
 * 
 * Download all orders:
 *   /api/export-orders?key=YOUR_ADMIN_PASSWORD
 * 
 * Filter by date range:
 *   /api/export-orders?key=YOUR_ADMIN_PASSWORD&from=2025-01-01&to=2025-03-31
 * 
 * The CSV file opens directly in Excel or can be 
 * imported into Google Sheets via File → Import.
 * 
 * OWNER SHORTCUT: Bookmark this URL:
 *   https://www.qasrafghan.com/api/export-orders?key=YOUR_ADMIN_PASSWORD
 */

import { client } from '@/sanity.client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Simple auth check — require the admin password
  const password = req.nextUrl.searchParams.get('key')
  if (password !== (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? 'qasr2024')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Date range from query params (optional)
  const from = req.nextUrl.searchParams.get('from') // YYYY-MM-DD
  const to   = req.nextUrl.searchParams.get('to')   // YYYY-MM-DD

  let filter = '_type == "order"'
  if (from) filter += ` && placedAt >= "${from}T00:00:00Z"`
  if (to)   filter += ` && placedAt <= "${to}T23:59:59Z"`

  const orders = await client.fetch(`
    *[${filter}] | order(placedAt desc) {
      orderId, status, orderType,
      customerName, customerPhone, customerEmail,
      items, subtotal, tax, total,
      promoCode, promoDiscount,
      specialRequests, tableNumber, guestCount,
      placedAt, notes
    }
  `)

  // Build CSV
  const headers = [
    'Order ID', 'Date', 'Time', 'Status', 'Order Type',
    'Customer Name', 'Phone', 'Email',
    'Items', 'Item Count', 'Subtotal', 'Tax',
    'Promo Code', 'Discount', 'Total',
    'Special Requests', 'Table', 'Guests', 'Notes'
  ]

  function escapeCSV(val: any): string {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = orders.map((o: any) => {
    const date     = new Date(o.placedAt)
    const dateStr  = date.toLocaleDateString('en-US')
    const timeStr  = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit' 
    })
    const items    = (o.items ?? [])
      .map((i: any) => `${i.quantity}x ${i.name}`)
      .join(' | ')
    const itemCount = (o.items ?? [])
      .reduce((s: number, i: any) => s + (i.quantity || 1), 0)

    return [
      o.orderId,        dateStr,          timeStr,
      o.status,         o.orderType,
      o.customerName,   o.customerPhone,  o.customerEmail,
      items,            itemCount,
      (o.subtotal ?? 0).toFixed(2),
      (o.tax ?? 0).toFixed(2),
      o.promoCode ?? '',
      (o.promoDiscount ?? 0).toFixed(2),
      (o.total ?? 0).toFixed(2),
      o.specialRequests ?? '',
      o.tableNumber ?? '',
      o.guestCount ?? '',
      o.notes ?? '',
    ].map(escapeCSV).join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')

  // Return as downloadable CSV file
  return new NextResponse(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="qasr-orders-${Date.now()}.csv"`,
    }
  })
}
