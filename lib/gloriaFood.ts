import type { GloriaFoodConfig } from '@/types/sanity'

export function isGloriaFoodReady(config: GloriaFoodConfig | null | undefined): boolean {
  if (!config) return false
  return Boolean(config.isEnabled && config.restaurantUUID && config.restaurantUUID.trim() !== '')
}
