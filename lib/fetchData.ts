import { client } from '@/sanity.client'
import {
  restaurantInfoQuery,
  menuItemsQuery,
  signatureDishesQuery,
  teamMembersQuery,
  cateringPlansQuery,
  testimonialsQuery,
} from './queries'
import type { RestaurantInfo, MenuItem, TeamMember, CateringPlan, Testimonial } from '@/types/sanity'

/** Preferred display order for menu categories */
const CATEGORY_ORDER = ['appetizers', 'kebabs', 'mains', 'rice', 'sides', 'desserts', 'beverages']

/** Human-readable labels for each menu category */
export const CATEGORY_LABELS: Record<string, string> = {
  appetizers: 'Appetizers',
  kebabs:     'Royal Kebabs',
  mains:      'Palace Mains',
  rice:       'Rice Dishes',
  sides:      'Bread & Sides',
  desserts:   'Desserts',
  beverages:  'Beverages',
}

export async function fetchRestaurantInfo(): Promise<RestaurantInfo | null> {
  try {
    const data = await client.fetch(restaurantInfoQuery, {}, { next: { revalidate: 60 } })
    return data ?? null
  } catch (error) {
    console.error('[fetchRestaurantInfo] Failed to fetch:', error)
    return null
  }
}

export async function fetchAllMenuItems(): Promise<MenuItem[]> {
  try {
    const data = await client.fetch(menuItemsQuery, {}, { next: { revalidate: 30 } })
    return data ?? []
  } catch (error) {
    console.error('[fetchAllMenuItems] Failed to fetch:', error)
    return []
  }
}

export async function fetchSignatureDishes(): Promise<MenuItem[]> {
  try {
    const data = await client.fetch(signatureDishesQuery, {}, { next: { revalidate: 30 } })
    return data ?? []
  } catch (error) {
    console.error('[fetchSignatureDishes] Failed to fetch:', error)
    return []
  }
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  try {
    const data = await client.fetch(teamMembersQuery, {}, { next: { revalidate: 300 } })
    return data ?? []
  } catch (error) {
    console.error('[fetchTeamMembers] Failed to fetch:', error)
    return []
  }
}

export async function fetchCateringPlans(): Promise<CateringPlan[]> {
  try {
    const data = await client.fetch(cateringPlansQuery, {}, { next: { revalidate: 300 } })
    return data ?? []
  } catch (error) {
    console.error('[fetchCateringPlans] Failed to fetch:', error)
    return []
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await client.fetch(testimonialsQuery, {}, { next: { revalidate: 300 } })
    return data ?? []
  } catch (error) {
    console.error('[fetchTestimonials] Failed to fetch:', error)
    return []
  }
}

export async function fetchMenuByCategory(): Promise<Record<string, MenuItem[]>> {
  const items = await fetchAllMenuItems()
  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    const cat = item.category || 'uncategorized'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const idxA = CATEGORY_ORDER.indexOf(a)
    const idxB = CATEGORY_ORDER.indexOf(b)
    if (idxA !== -1 && idxB !== -1) return idxA - idxB
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1
    return a.localeCompare(b)
  })
  const sorted: Record<string, MenuItem[]> = {}
  for (const key of sortedKeys) sorted[key] = grouped[key]
  return sorted
}
