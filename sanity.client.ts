import { createClient } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn:    false, // Always fresh data for a restaurant
  token:     process.env.SANITY_API_READ_TOKEN,
})

export const writeClient = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn:     false,
  token:      process.env.SANITY_API_WRITE_TOKEN,
})

const builder = createImageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}

/**
 * Returns a WebP-optimized image URL with exact dimensions.
 * Typically 60–80% smaller than originals.
 */
export function optimizedImage(
  source: any,
  options: {
    width?: number
    height?: number
    quality?: number
  } = {}
) {
  const { width, height, quality = 85 } = options
  let b = urlFor(source).format('webp').quality(quality)
  if (width)  b = b.width(width)
  if (height) b = b.height(height)
  return b.url()
}
