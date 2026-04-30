import { client } from '@/sanity.client'
import {
  restaurantInfoQuery,
  menuItemsQuery,
  menuCategoriesQuery,
  signatureDishesQuery,
  teamMembersQuery,
  cateringPlansQuery,
  testimonialsQuery,
  activePromoCodesQuery,
} from './queries'
import type { RestaurantInfo, MenuItem, MenuCategory, TeamMember, CateringPlan, Testimonial, PromoCode } from '@/types/sanity'
import type { CombinedReview } from '@/types/reviews'

export async function fetchActivePromoCodes(): Promise<PromoCode[]> {
  try {
    const data = await client.fetch(activePromoCodesQuery, {}, { next: { revalidate: 60 } })
    return data ?? []
  } catch (error) {
    console.error('[fetchActivePromoCodes] Failed to fetch:', error)
    return []
  }
}

/** Preferred display order for menu categories (fallback if Sanity has none) */
const FALLBACK_CATEGORY_ORDER = [
  'offers', 'lamb', 'chicken', 'family', 'wings', 'gyro', 'appetizers',
]

/**
 * Build a label map from fetched MenuCategory documents.
 * Falls back gracefully if categories list is empty.
 */
export function buildCategoryLabels(
  categories: MenuCategory[]
): Record<string, string> {
  if (!categories.length) {
    // Legacy fallback until Studio categories are created
    return {
      offers:     'Offers & Deals',
      lamb:       'Lamb Specials',
      chicken:    'Chicken Specials',
      family:     'Family Packages',
      wings:      'Buffalo Wild Wings',
      gyro:       'Gyro Specials',
      appetizers: 'Appetizers & Drinks',
    }
  }
  return Object.fromEntries(categories.map(c => [c.slug, c.title]))
}

/** Fetch all active menu categories, ordered by display order */
export async function fetchMenuCategories(): Promise<MenuCategory[]> {
  try {
    const data = await client.fetch(menuCategoriesQuery, {}, { next: { revalidate: 60 } })
    return data ?? []
  } catch (error) {
    console.error('[fetchMenuCategories] Failed to fetch:', error)
    return []
  }
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
  const [items, categories] = await Promise.all([
    fetchAllMenuItems(),
    fetchMenuCategories(),
  ])

  // Build an ordered list of slugs from Sanity categories, or fall back
  const orderedSlugs: string[] = categories.length
    ? categories.map(c => c.slug)
    : FALLBACK_CATEGORY_ORDER

  const grouped: Record<string, MenuItem[]> = {}
  for (const item of items) {
    const slug = item.category?.slug ?? 'other'
    if (!grouped[slug]) grouped[slug] = []
    grouped[slug].push(item)
  }

  const sorted: Record<string, MenuItem[]> = {}
  orderedSlugs.forEach(slug => {
    if (grouped[slug]) sorted[slug] = grouped[slug]
  })
  // Append any new categories not yet in the order list
  Object.keys(grouped).forEach(slug => {
    if (!sorted[slug]) sorted[slug] = grouped[slug]
  })
  return sorted
}

export async function fetchCombinedReviews(): Promise<{
  reviews:      CombinedReview[]
  googleRating: number | null
  totalCount:   number | null
}> {
  try {
    // Fetch settings
    const settings = await client.fetch(`
      *[_type == "googleReviewSettings"][0] {
        enabled, maxReviews, minRating, hiddenReviewIds
      }
    `)

    // If reviews disabled, return empty
    if (settings && settings.enabled === false) {
      return { reviews: [], googleRating: null, totalCount: null }
    }

    const maxReviews   = settings?.maxReviews   ?? 15
    const minRating    = settings?.minRating    ?? 4
    const hiddenIds    = settings?.hiddenReviewIds ?? []

    // Fetch manual Sanity reviews (highlighted by owner)
    const sanityReviews: any[] = await client.fetch(`
      *[_type == "testimonial" && isHighlighted == true]
      | order(order asc) {
        _id, quote, author, source, rating, 
        googleReviewUrl, isHighlighted
      }
    `)

    // Fetch cached Google reviews
    const cache: any = await client.fetch(`
      *[_id == "google-reviews-cache"][0] {
        reviewsJson, rating, totalCount, fetchedAt
      }
    `)

    let googleReviews: CombinedReview[] = []
    
    if (cache?.reviewsJson) {
      try {
        const parsed = JSON.parse(cache.reviewsJson)
        googleReviews = parsed
          .filter((r: any) =>
            (r.rating ?? 0) >= minRating &&
            !hiddenIds.includes(
              r.authorAttribution?.uri ?? ''
            )
          )
          .map((r: any): CombinedReview => ({
            id:      r.name ?? String(Math.random()),
            quote:   r.text?.text ?? '',
            author:  r.authorAttribution?.displayName ?? 
                     'Google Customer',
            rating:  r.rating ?? 5,
            source:  'google',
            timeAgo: r.relativePublishTimeDescription,
            url:     r.authorAttribution?.uri,
          }))
          // Only take enough Google reviews to reach maxReviews
          .slice(0, Math.max(0, maxReviews - sanityReviews.length))
      } catch { 
        googleReviews = []
      }
    }

    // Format Sanity reviews
    const formattedSanity: CombinedReview[] = sanityReviews.map(r => ({
      id:     r._id,
      quote:  r.quote,
      author: r.author,
      rating: r.rating ?? 5,
      source: (r.source ?? 'google') as CombinedReview['source'],
      url:    r.googleReviewUrl,
    }))

    // Combine: Sanity first, Google fills remaining slots
    const combined = [
      ...formattedSanity,
      ...googleReviews,
    ]

    // Deduplicate by author name
    const seen = new Set<string>()
    const deduped = combined.filter(review => {
      const key = review.author.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return {
      reviews:      deduped.slice(0, maxReviews),
      googleRating: cache?.rating ?? null,
      totalCount:   cache?.totalCount ?? null,
    }

  } catch (err) {
    console.error('[fetchCombinedReviews] Error:', err)
    return { reviews: [], googleRating: null, totalCount: null }
  }
}
