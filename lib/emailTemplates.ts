// ═══════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════

interface ReceiptEmailData {
  orderId: string
  customerName: string
  orderType: 'pickup' | 'dine-in'
  tableNumber?: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  tax: number
  total: number
  specialRequests?: string
  placedAt: string
}

export interface OwnerOrderData {
  orderId: string
  customerName: string
  customerPhone: string
  orderType: 'pickup' | 'dine-in'
  tableNumber?: string
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  tax: number
  total: number
  specialRequests?: string
  placedAt: string
}

export interface OwnerCateringData {
  customerName: string
  email: string
  phone: string
  selectedPlan?: string
  eventDate: string
  guestCount: number
  message: string
  submittedAt: string
}

// ═══════════════════════════════════════
// CUSTOMER RECEIPT
// ═══════════════════════════════════════

export function generateReceiptHTML(data: ReceiptEmailData): string {
  const isDineIn = data.orderType === 'dine-in'
  
  const itemsHTML = data.items.map(item => `
    <table width="100%" style="margin-bottom: 12px;">
      <tr>
        <td style="color: rgba(255,255,255,0.7); font-size: 14px; font-family: Arial, sans-serif;">
          ${item.name}
          <span style="color: rgba(255,255,255,0.3); font-size: 11px;"> × ${item.quantity}</span>
        </td>
        <td style="color: #C9A84C; font-size: 14px; text-align: right; font-family: Arial, sans-serif;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    </table>
  `).join('')

  const totalsHTML = [
    ['Subtotal', `$${data.subtotal.toFixed(2)}`],
    ['Tax (8%)', `$${data.tax.toFixed(2)}`],
    [isDineIn ? 'Service' : 'Pickup', isDineIn ? 'AT TABLE' : 'FREE'],
  ].map(([label, value]) => `
    <table width="100%" style="margin-bottom: 6px;">
      <tr>
        <td style="color: rgba(255,255,255,0.3); font-size: 11px; font-family: Arial, sans-serif; letter-spacing: 0.05em;">${label}</td>
        <td style="color: rgba(255,255,255,0.5); font-size: 11px; text-align: right; font-family: Arial, sans-serif;">${value}</td>
      </tr>
    </table>
  `).join('')

  const placedDate = new Date(data.placedAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const typeLabel = isDineIn ? `🍽️ Dine In — Table ${data.tableNumber}` : '🏪 Pickup Order — Ready in 25–35 min'
  const message = isDineIn 
    ? `Your order has been received! Our team will bring your food to <strong>Table ${data.tableNumber}</strong> as soon as it is ready. You will receive an SMS confirmation shortly.`
    : `Your order has been received and is now being prepared. You will receive an SMS confirmation shortly.`

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmation — Qasr Afghan</title></head>
<body style="margin: 0; padding: 0; background-color: #0A0805; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="text-align: center; padding-bottom: 32px; border-bottom: 1px solid #2C2720;">
        <div style="display: inline-block; border: 1px solid rgba(201,168,76,0.3); padding: 16px 32px; margin-bottom: 16px;">
          <p style="color: #C9A84C; font-size: 24px; letter-spacing: 0.3em; margin: 0; font-style: italic;">Qasr Afghan</p>
        </div>
        <p style="color: rgba(255,255,255,0.3); font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; margin: 8px 0 0 0; font-family: Arial, sans-serif;">BUFFALO, NEW YORK  ·  AUTHENTIC AFGHAN CUISINE</p>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding: 40px 0 32px;">
        <p style="color: rgba(255,255,255,0.3); font-size: 10px; letter-spacing: 0.35em; text-transform: uppercase; margin: 0 0 12px 0; font-family: Arial, sans-serif;">ORDER CONFIRMED</p>
        <h1 style="color: #C9A84C; font-size: 36px; font-weight: 300; letter-spacing: 0.15em; margin: 0;">${data.orderId}</h1>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; font-family: Arial, sans-serif; letter-spacing: 0.1em; margin: 12px 0 0 0;">
          ${typeLabel}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 24px 0;">
        <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin: 0; font-family: Arial, sans-serif;">
          Dear ${data.customerName},<br><br>
          ${message}
        </p>
      </td>
    </tr>
    <tr>
      <td style="background: #141210; border: 1px solid #2C2720; padding: 24px; margin-bottom: 24px;">
        <p style="color: rgba(201,168,76,0.7); font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase; font-family: Arial, sans-serif; margin: 0 0 16px 0;">YOUR ORDER</p>
        ${itemsHTML}
        <div style="border-top: 1px solid #2C2720; margin: 16px 0;"></div>
        ${totalsHTML}
        <div style="border-top: 1px solid #2C2720; margin: 12px 0 8px;"></div>
        <table width="100%">
          <tr>
            <td style="color: white; font-size: 15px; font-family: Georgia, serif; letter-spacing: 0.05em;">Total</td>
            <td style="color: #C9A84C; font-size: 18px; text-align: right; font-family: Georgia, serif;">$${data.total.toFixed(2)}</td>
          </tr>
        </table>
      </td>
    </tr>
    ${data.specialRequests ? `<tr><td style="padding: 0 0 20px 0;"><p style="color: rgba(201,168,76,0.6); font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif; margin: 0 0 6px 0;">SPECIAL REQUESTS</p><p style="color: rgba(255,255,255,0.4); font-size: 13px; font-family: Arial, sans-serif; font-style: italic; margin: 0;">${data.specialRequests}</p></td></tr>` : ''}
    <tr>
      <td style="border-top: 1px solid #2C2720; padding-top: 32px; text-align: center;">
        <p style="color: rgba(255,255,255,0.2); font-size: 11px; font-family: Arial, sans-serif; line-height: 1.7; margin: 0;">
          Questions? Call us or reply to this email.<br>Qasr Afghan · Buffalo, NY<br><span style="color: rgba(201,168,76,0.4);">◆</span>
        </p>
        <p style="color: rgba(255,255,255,0.1); font-size: 10px; font-family: Arial, sans-serif; margin: 16px 0 0 0; font-style: italic;">Placed at ${placedDate}</p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ═══════════════════════════════════════
// OWNER ORDER NOTIFICATION
// ═══════════════════════════════════════

export function generateOwnerOrderHTML(data: OwnerOrderData): string {
  const isDineIn = data.orderType === 'dine-in'
  
  const itemsHTML = data.items.map(item =>
    `<tr><td style="color:rgba(255,255,255,0.7);font-size:14px;font-family:Arial,sans-serif;padding:8px 0;">${item.quantity}×  ${item.name}</td><td style="color:#C9A84C;font-size:14px;text-align:right;font-family:Arial,sans-serif;padding:8px 0;">$${(item.price * item.quantity).toFixed(2)}</td></tr>`
  ).join('')

  const placedDate = new Date(data.placedAt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const specialHTML = data.specialRequests ? `
  <tr><td style="padding:16px 0;">
    <div style="border:2px solid #ff4444;border-radius:4px;padding:12px;background:rgba(255,68,68,0.05);">
      <p style="color:#ff6666;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;font-family:Arial,sans-serif;margin:0 0 6px;">⚠ SPECIAL REQUESTS</p>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;font-style:italic;margin:0;font-family:Arial,sans-serif;">${data.specialRequests}</p>
    </div>
  </td></tr>` : ''

  const typeLabel = isDineIn ? `🍽️ NEW DINE IN (Table ${data.tableNumber})` : '🔔 NEW PICKUP ORDER'

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>New Order</title></head>
<body style="margin:0;padding:0;background:#0A0805;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:550px;margin:0 auto;padding:30px 20px;">
  <tr><td style="text-align:center;padding-bottom:20px;border-bottom:1px solid #2C2720;">
    <p style="color:#C9A84C;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin:0;">${typeLabel}</p>
    <h1 style="color:#C9A84C;font-size:36px;font-weight:700;letter-spacing:0.1em;margin:8px 0 0;">${data.orderId}</h1>
    <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:8px 0 0;">Placed at ${placedDate}</p>
  </td></tr>
  <tr><td style="padding:20px 0;">
    <table width="100%">
      <tr><td style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;">CUSTOMER</td><td style="color:white;font-size:16px;text-align:right;font-weight:bold;">${data.customerName}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;padding-top:10px;">PHONE</td><td style="text-align:right;padding-top:10px;"><a href="tel:${data.customerPhone}" style="color:#C9A84C;font-size:16px;text-decoration:none;font-weight:bold;">${data.customerPhone}</a></td></tr>
      ${isDineIn ? `<tr><td style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;padding-top:10px;">TABLE</td><td style="text-align:right;padding-top:10px;color:white;font-size:24px;font-weight:bold;">${data.tableNumber}</td></tr>` : ''}
    </table>
  </td></tr>
  <tr><td style="background:#141210;border:1px solid #2C2720;padding:16px;">
    <p style="color:rgba(201,168,76,0.7);font-size:9px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">ORDER ITEMS</p>
    <table width="100%">${itemsHTML}</table>
    <div style="border-top:2px solid #2C2720;margin:12px 0 8px;"></div>
    <table width="100%">
      <tr><td style="color:rgba(255,255,255,0.3);font-size:11px;">Subtotal</td><td style="color:rgba(255,255,255,0.5);font-size:11px;text-align:right;">$${data.subtotal.toFixed(2)}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.3);font-size:11px;">Tax</td><td style="color:rgba(255,255,255,0.5);font-size:11px;text-align:right;">$${data.tax.toFixed(2)}</td></tr>
    </table>
    <div style="border-top:2px solid #C9A84C;margin:10px 0;"></div>
    <table width="100%"><tr><td style="color:white;font-size:20px;font-weight:bold;">TOTAL</td><td style="color:#C9A84C;font-size:24px;text-align:right;font-weight:bold;">$${data.total.toFixed(2)}</td></tr></table>
  </td></tr>
  ${specialHTML}
  <tr><td style="text-align:center;padding-top:20px;border-top:1px solid #2C2720;">
    <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:0;line-height:1.6;">Reply to this email or call the customer directly.<br>Qasr Afghan · Automated Order Notification</p>
  </td></tr>
</table></body></html>`
}

// ═══════════════════════════════════════
// OWNER CATERING NOTIFICATION
// ═══════════════════════════════════════

export function generateOwnerCateringHTML(data: OwnerCateringData): string {
  const submittedDate = new Date(data.submittedAt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Catering Inquiry</title></head>
<body style="margin:0;padding:0;background:#0A0805;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:550px;margin:0 auto;padding:30px 20px;">
  <tr><td style="text-align:center;padding-bottom:20px;border-bottom:1px solid #2C2720;">
    <p style="color:#C9A84C;font-size:12px;letter-spacing:0.3em;text-transform:uppercase;margin:0;">🍽️  NEW CATERING INQUIRY</p>
    <h1 style="color:#C9A84C;font-size:28px;font-weight:300;letter-spacing:0.1em;margin:10px 0 0;">${data.customerName}</h1>
    <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:6px 0 0;">Received ${submittedDate}</p>
  </td></tr>
  <tr><td style="padding:20px 0;">
    <table width="100%">
      <tr><td style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;padding:6px 0;">NAME</td><td style="color:white;font-size:14px;text-align:right;padding:6px 0;">${data.customerName}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;padding:6px 0;">EMAIL</td><td style="text-align:right;padding:6px 0;"><a href="mailto:${data.email}" style="color:#C9A84C;font-size:14px;text-decoration:none;">${data.email}</a></td></tr>
      <tr><td style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;padding:6px 0;">PHONE</td><td style="text-align:right;padding:6px 0;"><a href="tel:${data.phone}" style="color:#C9A84C;font-size:14px;text-decoration:none;">${data.phone}</a></td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#141210;border:1px solid #2C2720;padding:16px;">
    <p style="color:rgba(201,168,76,0.7);font-size:9px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 12px;">EVENT DETAILS</p>
    <table width="100%">
      ${data.selectedPlan ? `<tr><td style="color:rgba(255,255,255,0.4);font-size:11px;padding:6px 0;">PACKAGE</td><td style="color:white;font-size:14px;text-align:right;padding:6px 0;">${data.selectedPlan}</td></tr>` : ''}
      <tr><td style="color:rgba(255,255,255,0.4);font-size:11px;padding:6px 0;">DATE</td><td style="color:white;font-size:14px;text-align:right;padding:6px 0;">${data.eventDate}</td></tr>
      <tr><td style="color:rgba(255,255,255,0.4);font-size:11px;padding:6px 0;">GUESTS</td><td style="color:#C9A84C;font-size:18px;text-align:right;font-weight:bold;padding:6px 0;">${data.guestCount}</td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:16px 0;">
    <p style="color:rgba(201,168,76,0.6);font-size:9px;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 8px;">CUSTOMER MESSAGE</p>
    <div style="border-left:3px solid #C9A84C;padding:12px 16px;background:#141210;">
      <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.7;margin:0;font-style:italic;">${data.message}</p>
    </div>
  </td></tr>
  <tr><td style="text-align:center;padding-top:20px;border-top:1px solid #2C2720;">
    <p style="color:#C9A84C;font-size:12px;font-weight:bold;margin:0 0 6px;">Respond within 24 hours to convert this lead.</p>
    <p style="color:rgba(255,255,255,0.15);font-size:10px;margin:0;">Qasr Afghan · Automated Catering Notification</p>
  </td></tr>
</table></body></html>`
}

// ═══════════════════════════════════════
// CUSTOMER ADJUSTMENT NOTIFICATION
// ═══════════════════════════════════════

export function generateAdjustmentHTML(data: {
  orderId: string,
  customerName: string,
  type: 'time' | 'price',
  newValue: string | number,
  reason?: string
}): string {
  const isTime = data.type === 'time'
  const message = isTime
    ? `Your pickup time has been adjusted to <strong>${data.newValue} minutes</strong> from now.`
    : `Your order total has been adjusted. The new total is <strong>$${Number(data.newValue).toFixed(2)}</strong>.`

  return `<!DOCTYPE html><html><body style="background:#0A0805;padding:40px;font-family:Arial,sans-serif;color:white;text-align:center;">
    <div style="max-width:500px;margin:0 auto;border:1px solid #C9A84C;padding:40px;">
      <h2 style="color:#C9A84C;letter-spacing:0.2em;text-transform:uppercase;">Order Update</h2>
      <p style="font-size:24px;margin:20px 0;">#${data.orderId}</p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hello ${data.customerName},<br><br>${message}</p>
      ${data.reason ? `<p style="background:rgba(201,168,76,0.1);padding:15px;font-style:italic;color:#C9A84C;margin-top:20px;">"${data.reason}"</p>` : ''}
      <p style="margin-top:40px;color:rgba(255,255,255,0.3);font-size:12px;">Thank you for your patience.<br>Qasr Afghan</p>
    </div>
  </body></html>`
}

// ═══════════════════════════════════════
// CUSTOMER CANCELLATION NOTIFICATION
// ═══════════════════════════════════════

export function generateCancellationHTML(data: {
  orderId: string,
  customerName: string,
  reason?: string
}): string {
  return `<!DOCTYPE html><html><body style="background:#0A0805;padding:40px;font-family:Arial,sans-serif;color:white;text-align:center;">
    <div style="max-width:500px;margin:0 auto;border:1px solid #ff4444;padding:40px;">
      <h2 style="color:#ff4444;letter-spacing:0.2em;text-transform:uppercase;">Order Cancelled</h2>
      <p style="font-size:24px;margin:20px 0;">#${data.orderId}</p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hello ${data.customerName},<br><br>We're sorry, but your order has been cancelled.</p>
      ${data.reason ? `<div style="background:rgba(255,68,68,0.1);padding:15px;color:#ff6666;margin-top:20px;text-align:left;">
        <p style="font-size:10px;text-transform:uppercase;margin:0 0 5px;">Reason:</p>
        <p style="margin:0;font-style:italic;">${data.reason}</p>
      </div>` : ''}
      <p style="margin-top:40px;color:rgba(255,255,255,0.3);font-size:12px;">If you have already paid, a refund will be processed shortly.<br>Questions? Call us directly.</p>
    </div>
  </body></html>`
}

