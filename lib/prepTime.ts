import { CartItem } from '@/context/CartContext'

interface PrepTimeResult {
  minutes:     number   // total estimated minutes
  displayText: string   // e.g. "25–30 minutes"
  isEstimate:  boolean  // true when no prepTime data available
}

/**
 * Calculates estimated prep time for an order.
 * 
 * Formula: max(all item prep times) + 5 × (itemCount - 1)
 * 
 * Examples:
 *   1 item  (20 min):              20 + 5×0 = 20 min
 *   2 items (20 min, 18 min):      20 + 5×1 = 25 min
 *   3 items (20, 18, 12):          20 + 5×2 = 30 min
 *   4 items (20, 18, 12, 15):      20 + 5×3 = 35 min
 */
export function calculatePrepTime(
  items: CartItem[],
  restaurantStatus?: 'open' | 'busy' | 'paused',
  busyExtraMinutes?: number
): PrepTimeResult {
  // If no items or no prepTime data, return default
  if (!items || items.length === 0) {
    return {
      minutes:     25,
      displayText: '25–35 minutes',
      isEstimate:  true,
    }
  }

  // Check if any item has prepTime data
  const hasPrepData = items.some(item => item.prepTime != null)

  if (!hasPrepData) {
    return {
      minutes:     25,
      displayText: '25–35 minutes',
      isEstimate:  true,
    }
  }

  // Get prep time for each unique item (accounting for quantity
  // — ordering 3 of the same item doesn't triple the prep time)
  const uniqueItems = items.reduce((acc, item) => {
    if (!acc.find(i => i.id === item.id)) acc.push(item)
    return acc
  }, [] as CartItem[])

  // Max prep time across all unique items
  const maxPrepTime = Math.max(
    ...uniqueItems.map(item => item.prepTime ?? 20)
  )

  // Buffer: 5 × (total item count - 1)
  // Use total item count (with quantities) not unique count
  const totalItemCount = items.reduce(
    (sum, item) => sum + item.quantity, 0
  )
  const buffer = 5 * Math.max(0, totalItemCount - 1)

  let totalMinutes = maxPrepTime + buffer

  // Add busy time if restaurant is busy
  if (restaurantStatus === 'busy' && busyExtraMinutes) {
    totalMinutes += busyExtraMinutes
  }

  // Round to nearest 5 for cleaner display
  const rounded = Math.ceil(totalMinutes / 5) * 5

  // Display as a range: calculated to calculated+5
  const displayText = `${rounded}–${rounded + 5} minutes`

  return {
    minutes:     rounded,
    displayText,
    isEstimate: false,
  }
}

/**
 * Formats prep time for SMS messages.
 * Returns: "approximately 25 minutes"
 */
export function formatPrepTimeForSMS(minutes: number): string {
  return `approximately ${minutes} minutes`
}

/**
 * Returns prep time text for the order confirmation page.
 */
export function getPrepTimeDisplay(minutes: number): string {
  if (minutes <= 20) return `${minutes} minutes`
  if (minutes <= 30) return `25–30 minutes`
  if (minutes <= 40) return `30–40 minutes`
  if (minutes <= 50) return `40–50 minutes`
  return `${minutes}–${minutes + 10} minutes`
}
