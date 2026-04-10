export interface OpeningHours {
  days: string
  hours: string
  isClosed: boolean
}

export interface StoreStatus {
  isOpen: boolean
  message: string
  nextOpenTime?: string
  closingTime?: string
  todayHours?: string
}

/**
 * Safely parse "11:00 AM" or "10:00 PM" into minutes since midnight.
 * Returns -1 for any input that is missing, null, empty, or unparseable.
 * NEVER throws.
 */
function parseTimeToMinutes(timeStr: string | undefined | null): number {
  if (!timeStr || typeof timeStr !== 'string') return -1
  const trimmed = timeStr.trim()
  if (!trimmed) return -1

  const lastSpace = trimmed.lastIndexOf(' ')
  if (lastSpace === -1) return -1

  const timePart   = trimmed.substring(0, lastSpace).trim()
  const periodPart = trimmed.substring(lastSpace + 1).trim().toUpperCase()

  if (!timePart || !periodPart) return -1
  if (periodPart !== 'AM' && periodPart !== 'PM') return -1

  const colon     = timePart.indexOf(':')
  const hourStr   = colon !== -1 ? timePart.substring(0, colon) : timePart
  const minuteStr = colon !== -1 ? timePart.substring(colon + 1) : '0'

  let hours     = parseInt(hourStr, 10)
  const minutes = parseInt(minuteStr, 10)

  if (isNaN(hours) || isNaN(minutes)) return -1
  if (hours < 0 || hours > 12)        return -1
  if (minutes < 0 || minutes > 59)    return -1

  if (periodPart === 'PM' && hours !== 12) hours += 12
  if (periodPart === 'AM' && hours === 12) hours  = 0

  return hours * 60 + minutes
}

/**
 * Parse "Monday – Thursday" or "Friday, Saturday" or "Sunday"
 * into an array of day indices.  0 = Sunday … 6 = Saturday.
 * Returns [] for any bad input. NEVER throws.
 */
function parseDayRange(daysStr: string | undefined | null): number[] {
  if (!daysStr || typeof daysStr !== 'string') return []
  const trimmed = daysStr.trim()
  if (!trimmed) return []

  const dayNames = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday',
  ]

  // Normalise all dash variants (en-dash –, em-dash —, hyphen -) to ASCII hyphen
  const normalised = trimmed
    .toLowerCase()
    .replace(/[–—]/g, '-')

  // Range: "monday - thursday"
  const dashIdx = normalised.indexOf('-')
  if (dashIdx !== -1) {
    const startName = normalised.substring(0, dashIdx).trim()
    const endName   = normalised.substring(dashIdx + 1).trim()
    const start     = dayNames.indexOf(startName)
    const end       = dayNames.indexOf(endName)

    if (start !== -1 && end !== -1 && start <= end) {
      const result: number[] = []
      for (let i = start; i <= end; i++) result.push(i)
      return result
    }
  }

  // List or single: "friday, saturday" or "sunday"
  return normalised
    .split(/[,&]/)
    .map(s => dayNames.indexOf(s.trim()))
    .filter(i => i !== -1)
}

/**
 * Look forward up to 7 days to describe the next opening time.
 * Returns a human-readable string like "Tomorrow at 11:00 AM".
 * Returns "Soon" if nothing is found. NEVER throws.
 */
function getNextOpenTime(
  hours: OpeningHours[],
  from: Date,
): string {
  for (let d = 1; d <= 7; d++) {
    const next    = new Date(from)
    next.setDate(next.getDate() + d)
    const nextDay = next.getDay()

    const entry = hours.find(e => {
      if (!e || e.isClosed || !e.days || !e.hours) return false
      return parseDayRange(e.days).includes(nextDay)
    })

    if (entry?.hours) {
      const openStr = entry.hours
        .split(/\s*[-–—]\s*/)[0]
        ?.trim()

      if (openStr) {
        const label = d === 1
          ? 'Tomorrow'
          : next.toLocaleDateString('en-US', { weekday: 'long' })
        return `${label} at ${openStr}`
      }
    }
  }
  return 'Soon'
}

/**
 * Main export.
 * Returns the current store open/closed status based on openingHours
 * data from Sanity and the current time.
 *
 * Safe contract:
 *   - undefined or null openingHours  → defaults to isOpen: true
 *   - empty array                     → defaults to isOpen: true
 *   - entries with missing fields     → that entry is silently skipped
 *   - unparseable time strings        → defaults to isOpen: true
 *   - NEVER throws under any input
 */
export function getStoreStatus(
  openingHours: OpeningHours[] | undefined | null,
  now: Date = new Date(),
): StoreStatus {

  // ── Guard: no hours data at all → open by default so orders never blocked ──
  if (
    !openingHours ||
    !Array.isArray(openingHours) ||
    openingHours.length === 0
  ) {
    return { isOpen: true, message: 'Order Online' }
  }

  const currentDay     = now.getDay()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // ── Find today's open entry ──
  const todayEntry = openingHours.find(entry => {
    if (!entry)              return false
    if (entry.isClosed)      return false
    if (!entry.days)         return false
    if (!entry.hours)        return false
    return parseDayRange(entry.days).includes(currentDay)
  })

  // ── Find today's explicit closed entry ──
  const todayClosedEntry = openingHours.find(entry => {
    if (!entry)         return false
    if (!entry.isClosed) return false
    if (!entry.days)    return false
    return parseDayRange(entry.days).includes(currentDay)
  })

  // ── Today has no open entry ──
  if (!todayEntry) {
    return {
      isOpen: false,
      message: todayClosedEntry ? 'We are closed today' : 'Currently closed',
      nextOpenTime: getNextOpenTime(openingHours, now),
    }
  }

  // ── Split hours string on any dash variant ──
  const hoursParts = todayEntry.hours.split(/\s*[-–—]\s*/)
  const openStr    = hoursParts[0]?.trim()
  const closeStr   = hoursParts[1]?.trim()

  const openMinutes  = parseTimeToMinutes(openStr)
  const closeMinutes = parseTimeToMinutes(closeStr)

  // ── Unparseable hours → default to open rather than block orders ──
  if (openMinutes === -1 || closeMinutes === -1) {
    return {
      isOpen: true,
      message: 'Order Online',
      todayHours: todayEntry.hours,
    }
  }

  // ── Before opening time ──
  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      message: `Opens today at ${openStr}`,
      nextOpenTime: openStr,
      todayHours: todayEntry.hours,
    }
  }

  // ── After closing time ──
  if (currentMinutes >= closeMinutes) {
    return {
      isOpen: false,
      message: 'Closed for the night',
      nextOpenTime: getNextOpenTime(openingHours, now),
      todayHours: todayEntry.hours,
    }
  }

  // ── Currently open — calculate time remaining ──
  const minutesUntilClose = closeMinutes - currentMinutes
  const hoursLeft         = Math.floor(minutesUntilClose / 60)

  let closingTime = `Closes at ${closeStr}`
  if (minutesUntilClose <= 30) {
    closingTime = `Closing in ${minutesUntilClose} minute${minutesUntilClose !== 1 ? 's' : ''}`
  } else if (hoursLeft < 1) {
    closingTime = `Closing in ${minutesUntilClose} minutes`
  }

  return {
    isOpen: true,
    message: 'Order Online',
    closingTime,
    todayHours: todayEntry.hours,
  }
}
