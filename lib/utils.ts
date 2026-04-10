/**
 * Accepts either a full Google Maps iframe HTML string OR a plain
 * src URL. Always returns just the src URL string, or null if
 * nothing valid can be extracted.
 *
 * Handles all these input formats safely:
 *   - Full iframe HTML (what Google's "Copy HTML" button gives you)
 *   - Just the src URL
 *   - null / undefined / empty string
 */
export function extractMapSrc(
  input: string | undefined | null
): string | null {
  if (!input || typeof input !== 'string') return null

  const trimmed = input.trim()
  if (!trimmed) return null

  // If it contains an <iframe> tag, extract the src attribute
  if (trimmed.toLowerCase().includes('<iframe')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i)
    if (match && match[1]) {
      return match[1].trim()
    }
    return null
  }

  // Assume it is already a plain URL — validate it starts correctly
  if (
    trimmed.startsWith('https://www.google.com/maps') ||
    trimmed.startsWith('https://maps.google.com')
  ) {
    return trimmed
  }

  // Unknown format
  return null
}
