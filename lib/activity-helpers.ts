/**
 * Format time from seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

/**
 * Parse time string (MM:SS or HH:MM:SS) to seconds
 */
export function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(":").map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return 0
}

/**
 * Calculate pace (min/km) from distance and time
 */
export function calculatePace(distanceKm: number, timeSeconds: number): string {
  if (distanceKm === 0) return "0:00"
  const paceSeconds = timeSeconds / distanceKm
  const minutes = Math.floor(paceSeconds / 60)
  const seconds = Math.floor(paceSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Calculate distance from pace and time
 */
export function calculateDistance(paceString: string, timeSeconds: number): number {
  const paceSeconds = parseTimeToSeconds(paceString)
  if (paceSeconds === 0) return 0
  return timeSeconds / paceSeconds
}

/**
 * Format distance with appropriate unit
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  return `${distanceKm.toFixed(2)}km`
}

/**
 * Calculate calories burned (rough estimate)
 * Formula: calories = MET × weight(kg) × time(hours)
 * Running MET varies by pace, using 10 as average
 */
export function estimateCalories(
  distanceKm: number,
  timeSeconds: number,
  weightKg: number = 70
): number {
  const hours = timeSeconds / 3600
  const averageMET = 10 // Can be adjusted based on pace
  return Math.round(averageMET * weightKg * hours)
}

/**
 * Calculate VO2max estimate using Cooper formula
 * VO2max = (distance in meters - 504.9) / 44.73
 */
export function estimateVO2max(distance12MinMeters: number): number {
  return (distance12MinMeters - 504.9) / 44.73
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} month${months > 1 ? "s" : ""} ago`
  }
  const years = Math.floor(diffDays / 365)
  return `${years} year${years > 1 ? "s" : ""} ago`
}

/**
 * Convert meters per second to kilometers per hour
 */
export function mpsToKph(mps: number): number {
  return mps * 3.6
}

/**
 * Convert kilometers per hour to minutes per kilometer (pace)
 */
export function kphToPace(kph: number): string {
  if (kph === 0) return "0:00"
  const minutesPerKm = 60 / kph
  const minutes = Math.floor(minutesPerKm)
  const seconds = Math.round((minutesPerKm - minutes) * 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
