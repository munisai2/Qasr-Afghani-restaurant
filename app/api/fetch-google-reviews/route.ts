/**
 * Fetch and cache Google Reviews
 * 
 * Call this endpoint manually to refresh reviews:
 *   GET /api/fetch-google-reviews
 * 
 * For weekly updates, set up a Vercel cron job in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/fetch-google-reviews",
 *     "schedule": "0 9 * * 1"  // Every Monday at 9 AM
 *   }]
 * }
 * 
 * Or visit the URL manually whenever you want to refresh.
 */

import { writeClient } from '@/sanity.client'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const apiKey  = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: 'GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID not configured' },
      { status: 400 }
    )
  }

  try {
    // Google Places API (New) endpoint
    const url = `https://places.googleapis.com/v1/places/${placeId}`
    
    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key':   apiKey,
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json(
        { error: 'Google API error', details: err },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Save to Sanity cache
    await writeClient
      .createOrReplace({
        _type:       'googleReviewsCache',
        _id:         'google-reviews-cache',
        reviewsJson: JSON.stringify(data.reviews ?? []),
        rating:      data.rating ?? null,
        totalCount:  data.userRatingCount ?? null,
        fetchedAt:   new Date().toISOString(),
      })

    return NextResponse.json({
      success: true,
      count:   data.reviews?.length ?? 0,
      rating:  data.rating,
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
