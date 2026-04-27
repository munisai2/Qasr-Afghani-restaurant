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
  logoUrl?: string
  estimatedTime?: number
  discountAmount?: number
  adjustmentReason?: string
  promoCode?: string
  promoDiscount?: number
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
  logoUrl?: string
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
  logoUrl?: string
}

// ═══════════════════════════════════════
// CUSTOMER RECEIPT
// ═══════════════════════════════════════

export function generateReceiptHTML(data: ReceiptEmailData): string {
  const isDineIn = data.orderType === 'dine-in'
  const originalSubtotal = data.subtotal || 0
  const totalDelta = data.discountAmount !== undefined ? -data.discountAmount : 0
  const currentSubtotal = originalSubtotal + totalDelta
  
  // Conditional Promo Logic
  const originalPromo = data.promoDiscount || 0
  const isBogo = data.promoCode?.toUpperCase().includes('BOGO')
  let dynamicPromo = originalPromo

  if (!isBogo && originalSubtotal > 0) {
    const promoRatio = originalPromo / originalSubtotal
    dynamicPromo = parseFloat((currentSubtotal * promoRatio).toFixed(2))
  }
  
  // New Logic: Tax on (Subtotal - Promo)
  const discountedSubtotal = Math.max(0, currentSubtotal - dynamicPromo)
  const finalTax = parseFloat((discountedSubtotal * 0.08).toFixed(2))
  const finalTotal = parseFloat((discountedSubtotal + finalTax).toFixed(2))

  const itemsHTML = (data.items || []).map(item => `
    <tr style="border-bottom: 1px solid #2C2720;">
      <td style="padding: 12px 0; color: rgba(255,255,255,0.8); font-size: 14px; font-family: Arial, sans-serif;">${item.quantity}x ${item.name}</td>
      <td style="padding: 12px 0; text-align: right; color: #C9A84C; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')

  const adjustmentRowHTML = totalDelta !== 0 ? `
    <tr>
      <td style="padding: 8px 0; color: ${totalDelta < 0 ? '#4ADE80' : '#F97316'}; font-size: 14px; font-family: Arial, sans-serif;">Kitchen Adjustment</td>
      <td style="padding: 8px 0; text-align: right; color: ${totalDelta < 0 ? '#4ADE80' : '#F97316'}; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;">(${totalDelta < 0 ? '−' : '+'}$${Math.abs(totalDelta).toFixed(2)})</td>
    </tr>` : ''

  const promoRowHTML = dynamicPromo > 0 ? `
    <tr>
      <td style="padding: 8px 0; color: #4ADE80; font-size: 14px; font-family: Arial, sans-serif;">Promo (${data.promoCode || 'Applied'})</td>
      <td style="padding: 8px 0; text-align: right; color: #4ADE80; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;">−$${dynamicPromo.toFixed(2)}</td>
    </tr>` : ''

  const totalsHTML = `
    <table width="100%" style="margin-top: 10px;">
      <tr>
        <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 14px; font-family: Arial, sans-serif;">Original Subtotal</td>
        <td style="padding: 8px 0; text-align: right; color: rgba(255,255,255,0.8); font-size: 14px; font-family: Arial, sans-serif;">$${originalSubtotal.toFixed(2)}</td>
      </tr>
      ${adjustmentRowHTML}
      ${promoRowHTML}
      <tr>
        <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 14px; font-family: Arial, sans-serif;">Tax (8% of $${discountedSubtotal.toFixed(2)})</td>
        <td style="padding: 8px 0; text-align: right; color: rgba(255,255,255,0.8); font-size: 14px; font-family: Arial, sans-serif;">$${finalTax.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 20px 0 0 0; color: white; font-weight: bold; font-size: 18px; font-family: Georgia, serif; letter-spacing: 0.05em;">FINAL TOTAL</td>
        <td style="padding: 20px 0 0 0; text-align: right; color: #C9A84C; font-weight: bold; font-size: 24px; font-family: Georgia, serif;">$${finalTotal.toFixed(2)}</td>
      </tr>
    </table>`

  const placedDate = new Date(data.placedAt).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long',
    day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const readyTime = data.estimatedTime ? `${data.estimatedTime} minutes` : '25–35 minutes'
  const typeLabel = isDineIn ? `🍽️ Dine In — Table ${data.tableNumber}` : `🏪 Pickup — Ready in ${readyTime}`
  
  const adjustment = data.discountAmount !== undefined ? -data.discountAmount : 0
  const hasAdjustment = adjustment !== 0
  
  const message = isDineIn 
    ? `Your order has been accepted by our kitchen! Our team will bring your food to <strong>Table ${data.tableNumber}</strong> as soon as it is ready.`
    : hasAdjustment
      ? `Your order has been accepted! There were slight adjustments made to your order by our kitchen team. The updated details are shown below.<br><br>Your order will be ready in approximately <strong>${readyTime}</strong>. We'll email you when it's ready for pickup.`
      : `Great news! Your order has been accepted by our kitchen and is now being prepared. It will be ready for pickup in approximately <strong>${readyTime}</strong>.<br><br>We'll send you another email the moment your order is ready for collection.`

  const adjustmentBannerHTML = hasAdjustment ? `
    <tr><td style="padding: 0 0 20px 0;">
      <div style="border-left: 3px solid #C9A84C; background: rgba(201,168,76,0.08); padding: 14px 16px;">
        <p style="color: #C9A84C; font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif; margin: 0 0 8px 0;">ORDER ADJUSTMENT</p>
        <p style="color: rgba(255,255,255,0.7); font-size: 13px; font-family: Arial, sans-serif; margin: 0 0 6px 0;">
          An adjustment of <strong style="color: ${adjustment < 0 ? '#4ADE80' : '#F97316'};">${adjustment < 0 ? '−' : '+'}$${Math.abs(adjustment).toFixed(2)}</strong> has been applied to your order.
        </p>
        ${data.adjustmentReason ? `<p style="color: rgba(255,255,255,0.4); font-size: 12px; font-family: Arial, sans-serif; font-style: italic; margin: 0;">Reason: ${data.adjustmentReason}</p>` : ''}
      </div>
    </td></tr>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Order Confirmation — Qasr Afghan</title></head>
<body style="margin: 0; padding: 0; background-color: #0A0805; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <tr>
      <td style="text-align: center; padding-bottom: 32px; border-bottom: 1px solid #2C2720;">
        ${data.logoUrl 
          ? `<img src="${data.logoUrl}" alt="Qasr Afghan" width="100" height="100" style="display:block; margin:0 auto 16px auto; border-radius:50%; border:2px solid #C9A84C;" />`
          : `<div style="display: inline-block; border: 1px solid rgba(201,168,76,0.3); padding: 16px 32px; margin-bottom: 16px;">
              <p style="color: #C9A84C; font-size: 24px; letter-spacing: 0.3em; margin: 0; font-style: italic;">Qasr Afghan</p>
             </div>`
        }
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
          ${promoRowHTML}
        </table>
      </td>
    </tr>
    ${adjustmentBannerHTML}
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
    ${data.logoUrl 
      ? `<img src="${data.logoUrl}" alt="Qasr Afghan" width="100" height="100" style="display:block; margin:0 auto 16px auto; border-radius:50%; border:2px solid #C9A84C;" />`
      : ''
    }
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
    ${data.logoUrl 
      ? `<img src="${data.logoUrl}" alt="Qasr Afghan" width="100" height="100" style="display:block; margin:0 auto 16px auto; border-radius:50%; border:2px solid #C9A84C;" />`
      : ''
    }
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
  type: 'time' | 'price' | 'ready' | 'reservation_reminder',
  newValue: string | number,
  reason?: string,
  logoUrl?: string,
  discountAmount?: number
}): string {
  let message = ''
  let title = 'Order Update'
  let isReadyOrReminder = false
  let callActionHTML = ''

  if (data.type === 'time') {
    message = `Your pickup time has been adjusted to <strong>${data.newValue} minutes</strong> from now.`
  } else if (data.type === 'price') {
    message = `Your order total has been adjusted. The new total is <strong>$${Number(data.newValue).toFixed(2)}</strong>.`
  } else if (data.type === 'ready') {
    title = 'Order Ready'
    isReadyOrReminder = true
    message = `Hi ${data.customerName}, your order is ready for pickup at Qasr Afghan!<br><br>2487 Niagara Falls Blvd, Buffalo NY 14228<br><br>Please come in to collect your order.`
    callActionHTML = `<a href="tel:716-260-1613" style="display:inline-block; margin-top:20px; padding:12px 24px; background-color:#C9A84C; color:#0A0805; font-weight:bold; text-decoration:none; border-radius:4px; font-size:14px; letter-spacing:0.1em; text-transform:uppercase;">Call us: 716-260-1613</a>`
  } else if (data.type === 'reservation_reminder') {
    title = 'Reservation Reminder'
    isReadyOrReminder = true
    message = `Hi ${data.customerName}, a reminder that your reservation at Qasr Afghan is coming up!<br><br>Time: <strong>${data.newValue}</strong><br><br>Your food will be freshly prepared for your arrival.`
    callActionHTML = `<a href="tel:716-260-1613" style="display:inline-block; margin-top:20px; padding:12px 24px; background-color:#C9A84C; color:#0A0805; font-weight:bold; text-decoration:none; border-radius:4px; font-size:14px; letter-spacing:0.1em; text-transform:uppercase;">Questions? Call us: 716-260-1613</a>`
  }

  const logoHTML = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="Qasr Afghan" width="80" height="80" style="display:block; margin:0 auto 16px auto; border-radius:50%; border:2px solid #C9A84C;" />`
    : ''

  const headingHTML = isReadyOrReminder && data.type === 'ready'
    ? `<h1 style="color:#C9A84C; font-family:Georgia, serif; font-size:32px; font-weight:300; margin:10px 0;">✓ Your order is ready!</h1>`
    : `<h2 style="color:#C9A84C;letter-spacing:0.2em;text-transform:uppercase;margin:0;">${title}</h2>`

  const adjustment = data.discountAmount !== undefined ? -data.discountAmount : 0
  const hasAdjustment = adjustment !== 0
  const adjustmentBannerHTML = hasAdjustment ? `
    <div style="border-left: 3px solid #C9A84C; background: rgba(201,168,76,0.08); padding: 14px 16px; margin-top: 24px; text-align: left;">
      <p style="color: #C9A84C; font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; font-family: Arial, sans-serif; margin: 0 0 8px 0;">ORDER ADJUSTMENT</p>
      <p style="color: rgba(255,255,255,0.7); font-size: 13px; font-family: Arial, sans-serif; margin: 0 0 6px 0;">
        An adjustment of <strong style="color: ${adjustment < 0 ? '#4ADE80' : '#F97316'};">${adjustment < 0 ? '−' : '+'}$${Math.abs(adjustment).toFixed(2)}</strong> has been applied.
      </p>
    </div>` : ''

  return `<!DOCTYPE html><html><body style="background:#0A0805;padding:40px;font-family:Arial,sans-serif;color:white;text-align:center;margin:0;">
    <div style="max-width:500px;margin:0 auto;border:1px solid #2C2720;padding:40px;background:#141210;">
      ${logoHTML}
      ${headingHTML}
      <p style="font-size:24px;color:#C9A84C;letter-spacing:0.1em;margin:16px 0 24px;">#${data.orderId}</p>
      <p style="color:rgba(255,255,255,0.8);line-height:1.7;font-size:16px;">${!isReadyOrReminder ? `Hello ${data.customerName},<br><br>` : ''}${message}</p>
      ${adjustmentBannerHTML}
      ${data.reason ? `<p style="background:rgba(201,168,76,0.1);padding:15px;font-style:italic;color:#C9A84C;margin-top:16px;border-left:3px solid #C9A84C;text-align:left;">"${data.reason}"</p>` : ''}
      ${callActionHTML}
      <div style="margin-top:40px;border-top:1px solid #2C2720;padding-top:20px;">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;line-height:1.6;">Thank you for choosing Qasr Afghan.<br>2487 Niagara Falls Blvd, Buffalo NY 14228</p>
      </div>
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

