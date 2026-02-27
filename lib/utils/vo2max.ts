/**
 * VO2Max Calculation Utilities
 * 
 * Methods:
 * 1. Heart Rate Ratio Method - Based on HR data during activity
 * 2. Cooper Test Estimation - Based on distance covered in 12 minutes
 * 3. VDOT Method - Based on race performance
 */

interface VO2MaxParams {
  age: number
  weight: number // in kg
  restingHeartRate: number
  averageHeartRate?: number
  maxHeartRate?: number
  distance?: number // in meters
  time?: number // in seconds
  gender?: 'male' | 'female'
}

/**
 * Calculate VO2Max using Heart Rate Ratio Method
 * Formula: VO2max = 15.3 × (MHR / RHR)
 * More accurate when actual max heart rate is known
 */
export function calculateVO2Max(params: VO2MaxParams): number {
  const {
    age,
    restingHeartRate,
    averageHeartRate,
    maxHeartRate: actualMaxHR,
  } = params

  // Estimate max heart rate if not provided
  const maxHeartRate = actualMaxHR || (220 - age)

  if (!averageHeartRate) {
    return 0
  }

  // Heart Rate Reserve method for more accuracy
  const heartRateReserve = maxHeartRate - restingHeartRate
  const workingHeartRate = averageHeartRate - restingHeartRate
  const heartRateRatio = workingHeartRate / heartRateReserve

  // Base VO2Max calculation
  let vo2max = 15.3 * (maxHeartRate / restingHeartRate)

  // Adjust based on intensity (using heart rate ratio)
  // At 70-85% intensity, this gives more accurate results
  vo2max = vo2max * (0.7 + (heartRateRatio * 0.3))

  // Age adjustment factor (VO2max declines ~1% per year after age 25)
  if (age > 25) {
    const ageFactor = 1 - ((age - 25) * 0.01)
    vo2max = vo2max * ageFactor
  }

  return Math.round(vo2max * 10) / 10
}

/**
 * Calculate VO2Max using Cooper Test (12-minute run)
 * Formula: VO2max = (Distance in meters - 504.9) / 44.73
 */
export function calculateVO2MaxFromCooper(distanceMeters: number): number {
  const vo2max = (distanceMeters - 504.9) / 44.73
  return Math.round(vo2max * 10) / 10
}

/**
 * Calculate VO2Max using running performance
 * Based on Jack Daniels' VDOT formula
 */
export function calculateVO2MaxFromPerformance(params: {
  distance: number // in meters
  time: number // in seconds
  age: number
}): number {
  const { distance, time, age } = params
  
  // Calculate velocity (meters per minute)
  const velocity = (distance / time) * 60
  
  // Calculate percentage of VO2max being used
  const percentVO2max = 0.8 + (0.1894393 * Math.exp(-0.012778 * (time / 60))) + 
                        (0.2989558 * Math.exp(-0.1932605 * (time / 60)))
  
  // Calculate VO2 at this pace
  const vo2 = -4.6 + (0.182258 * velocity) + (0.000104 * velocity * velocity)
  
  // Calculate VO2max
  let vo2max = vo2 / percentVO2max
  
  // Age adjustment
  if (age > 25) {
    const ageFactor = 1 - ((age - 25) * 0.01)
    vo2max = vo2max * ageFactor
  }
  
  return Math.round(vo2max * 10) / 10
}

/**
 * Get fitness level category based on VO2Max
 */
export function getFitnessLevel(vo2max: number, age: number, gender: 'male' | 'female' = 'male'): string {
  const categories = gender === 'male' ? {
    elite: age < 30 ? 55 : age < 40 ? 52 : age < 50 ? 48 : 45,
    excellent: age < 30 ? 50 : age < 40 ? 46 : age < 50 ? 43 : 40,
    good: age < 30 ? 43 : age < 40 ? 40 : age < 50 ? 36 : 33,
    average: age < 30 ? 36 : age < 40 ? 33 : age < 50 ? 30 : 27,
    belowAverage: age < 30 ? 30 : age < 40 ? 27 : age < 50 ? 24 : 21,
  } : {
    elite: age < 30 ? 49 : age < 40 ? 45 : age < 50 ? 41 : 37,
    excellent: age < 30 ? 43 : age < 40 ? 39 : age < 50 ? 35 : 32,
    good: age < 30 ? 36 : age < 40 ? 33 : age < 50 ? 29 : 26,
    average: age < 30 ? 30 : age < 40 ? 27 : age < 50 ? 24 : 21,
    belowAverage: age < 30 ? 24 : age < 40 ? 21 : age < 50 ? 18 : 16,
  }

  if (vo2max >= categories.elite) return 'Elite'
  if (vo2max >= categories.excellent) return 'Excellent'
  if (vo2max >= categories.good) return 'Good'
  if (vo2max >= categories.average) return 'Average'
  if (vo2max >= categories.belowAverage) return 'Below Average'
  return 'Poor'
}

/**
 * Calculate recommended training zones based on VO2Max
 */
export function getTrainingZones(vo2max: number, restingHeartRate: number, age: number) {
  const maxHeartRate = 220 - age
  const heartRateReserve = maxHeartRate - restingHeartRate

  return {
    zone1: { // Recovery (50-60% HRR)
      min: Math.round(restingHeartRate + (heartRateReserve * 0.5)),
      max: Math.round(restingHeartRate + (heartRateReserve * 0.6)),
      name: 'Recovery',
      vo2Percent: '50-60%',
    },
    zone2: { // Aerobic (60-70% HRR)
      min: Math.round(restingHeartRate + (heartRateReserve * 0.6)),
      max: Math.round(restingHeartRate + (heartRateReserve * 0.7)),
      name: 'Aerobic',
      vo2Percent: '60-70%',
    },
    zone3: { // Tempo (70-80% HRR)
      min: Math.round(restingHeartRate + (heartRateReserve * 0.7)),
      max: Math.round(restingHeartRate + (heartRateReserve * 0.8)),
      name: 'Tempo',
      vo2Percent: '70-80%',
    },
    zone4: { // Threshold (80-90% HRR)
      min: Math.round(restingHeartRate + (heartRateReserve * 0.8)),
      max: Math.round(restingHeartRate + (heartRateReserve * 0.9)),
      name: 'Threshold',
      vo2Percent: '80-90%',
    },
    zone5: { // VO2Max (90-100% HRR)
      min: Math.round(restingHeartRate + (heartRateReserve * 0.9)),
      max: maxHeartRate,
      name: 'VO2Max',
      vo2Percent: '90-100%',
    },
  }
}

/**
 * Calculate race predictions based on VO2Max
 * Returns predicted times for common race distances
 */
export function predictRaceTimes(vo2max: number): {
  distance: string
  time: string
  pace: string
}[] {
  // VDOT-based predictions (simplified)
  const vdot = vo2max
  
  // These are approximations based on Jack Daniels' VDOT tables
  const predictions = [
    { distance: '5K', meters: 5000, percentVO2: 0.95 },
    { distance: '10K', meters: 10000, percentVO2: 0.92 },
    { distance: 'Half Marathon', meters: 21097, percentVO2: 0.88 },
    { distance: 'Marathon', meters: 42195, percentVO2: 0.85 },
  ]

  return predictions.map(({ distance, meters, percentVO2 }) => {
    const vo2 = vdot * percentVO2
    const velocity = (vo2 + 4.6 - 0.000104 * vo2 * vo2) / 0.182258 // meters per minute
    const timeMinutes = meters / velocity
    const timeSeconds = timeMinutes * 60
    
    // Format time as HH:MM:SS
    const hours = Math.floor(timeSeconds / 3600)
    const minutes = Math.floor((timeSeconds % 3600) / 60)
    const seconds = Math.floor(timeSeconds % 60)
    
    const time = hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    // Calculate pace per km
    const pacePerKm = (timeSeconds / (meters / 1000)) / 60
    const paceMin = Math.floor(pacePerKm)
    const paceSec = Math.floor((pacePerKm - paceMin) * 60)
    const pace = `${paceMin}:${paceSec.toString().padStart(2, '0')}`
    
    return { distance, time, pace: `${pace}/km` }
  })
}
