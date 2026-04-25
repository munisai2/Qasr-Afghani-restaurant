import { PromoCode } from '@/types/sanity'
import { CartItem } from '@/context/CartContext'

interface PromoResult {
  valid:     boolean
  discount:  number    // dollar amount to subtract
  error?:    string
  display?:  string    // e.g. "10% off" or "$5 off"
}

export function validatePromoCode(
  enteredCode:  string,
  activePromos: PromoCode[],
  subtotal:     number,
  cartItems:    CartItem[]
): PromoResult {
  
  if (!activePromos || activePromos.length === 0) {
    return { valid: false, discount: 0, 
             error: 'No active promo codes at this time.' }
  }

  const codeUpper = enteredCode.trim().toUpperCase()
  const promo = activePromos.find(p => p.code.trim().toUpperCase() === codeUpper)

  if (!promo) {
    return { valid: false, discount: 0, 
             error: 'Invalid promo code.' }
  }

  // Check expiry
  if (promo.expiryDate) {
    const expiry = new Date(promo.expiryDate)
    expiry.setHours(23, 59, 59, 999)  // end of expiry day
    if (new Date() > expiry) {
      return { valid: false, discount: 0, 
               error: 'This promo code has expired.' }
    }
  }

  // Check minimum order
  const minimum = promo.minOrderAmount ?? 0
  if (subtotal < minimum) {
    return { 
      valid: false, discount: 0,
      error: `Minimum order of $${minimum.toFixed(2)} required for this code.`
    }
  }

  // Calculate discount
  let discount = 0
  let display  = ''

  if (promo.discountType === 'percentage') {
    const pct  = promo.discountValue ?? 0
    discount   = subtotal * (pct / 100)
    display    = `${pct}% off`
  } else if (promo.discountType === 'fixed') {
    discount = promo.discountValue ?? 0
    display  = `$${discount.toFixed(2)} off`
  } else if (promo.discountType === 'bogo') {
    // Buy 1 Get 1 Free logic
    const applicableIds = promo.applicableItemIds || []
    
    // Find all applicable items in the cart
    const qualifyingItems: {price: number, quantity: number}[] = []
    
    for (const item of cartItems) {
      if (applicableIds.length === 0 || applicableIds.includes(item.id)) {
        qualifyingItems.push({ price: item.price, quantity: item.quantity })
      }
    }
    
    // Count total quantity of qualifying items
    const totalQualifyingQty = qualifyingItems.reduce((sum, item) => sum + item.quantity, 0)
    
    if (totalQualifyingQty < 2) {
      return { 
        valid: false, discount: 0,
        error: 'You need at least two qualifying items in your cart for this BOGO offer.'
      }
    }
    
    // Sort all individual qualifying item prices from cheapest to most expensive
    const allPrices: number[] = []
    for (const item of qualifyingItems) {
      for (let i = 0; i < item.quantity; i++) {
        allPrices.push(item.price)
      }
    }
    allPrices.sort((a, b) => a - b)
    
    // Calculate number of free items (Buy 1 Get 1 = totalQty / 2 rounded down)
    const numberOfFreeItems = Math.floor(allPrices.length / 2)
    
    // Discount is the sum of the cheapest items
    discount = allPrices.slice(0, numberOfFreeItems).reduce((sum, price) => sum + price, 0)
    display = 'BOGO'
  }

  // Cannot discount more than the subtotal
  discount = Math.min(discount, subtotal)
  discount = Math.round(discount * 100) / 100  // round to cents

  return { valid: true, discount, display }
}
