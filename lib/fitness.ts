/**
 * Estimate VO2max using the Heart Rate Reserve method.
 * Default age/restingHR are used when profile data is unavailable.
 */
export function computeVO2Max(
  avgHR: number,
  maxHR: number | null,
  age = 30,
  restingHR = 60,
): number {
  const mhr = maxHR || 220 - age
  const hrr = mhr - restingHR
  const workHR = avgHR - restingHR
  let vo2 = 15.3 * (mhr / restingHR)
  vo2 = vo2 * (0.7 + (workHR / hrr) * 0.3)
  if (age > 25) vo2 = vo2 * (1 - (age - 25) * 0.01)
  return Math.round(vo2 * 10) / 10
}

/** Human-readable fitness label for a given VO2max value. */
export function fitnessLabel(vo2: number | null | undefined): string {
  if (!vo2) return "—"
  if (vo2 >= 50) return "Exceptional"
  if (vo2 >= 45) return "Excellent"
  if (vo2 >= 40) return "Very Good"
  if (vo2 >= 35) return "Good"
  if (vo2 >= 30) return "Average"
  return "Below Average"
}

/**
 * Convert a VO2max value to a 0–100 progress percentage.
 * Scale anchored to the 25–65 mL/kg/min range.
 */
export function vo2Progress(vo2: number): number {
  return Math.min(100, Math.max(0, ((vo2 - 25) / 40) * 100))
}
