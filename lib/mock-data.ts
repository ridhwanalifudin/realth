import type { Activity } from "@/store/activities"
import type { UserProfile, BiometricRecord } from "@/store/user"

// Mock User Profile
export const mockUser: UserProfile = {
  id: "user-1",
  email: "runner@realth.app",
  full_name: "Alex Runner",
  age: 28,
  height: 175, // cm
  gender: "male",
  weight_goal: 70, // kg
  current_vo2max_avg: 48.5,
  fitness_level: "Intermediate",
  created_at: "2024-01-01T00:00:00Z",
}

// Mock Biometric History
export const mockBiometrics: BiometricRecord[] = [
  {
    id: "bio-1",
    user_id: "user-1",
    weight: 70.5,
    fat_percentage: 18.0,
    recorded_at: "2026-01-12T07:00:00Z",
  },
  {
    id: "bio-2",
    user_id: "user-1",
    weight: 71.0,
    fat_percentage: 18.2,
    recorded_at: "2026-01-10T07:00:00Z",
  },
  {
    id: "bio-3",
    user_id: "user-1",
    weight: 71.5,
    fat_percentage: 18.5,
    recorded_at: "2026-01-08T07:00:00Z",
  },
  {
    id: "bio-4",
    user_id: "user-1",
    weight: 72.0,
    fat_percentage: 18.8,
    recorded_at: "2026-01-05T07:00:00Z",
  },
  {
    id: "bio-5",
    user_id: "user-1",
    weight: 72.5,
    fat_percentage: 19.0,
    recorded_at: "2026-01-01T07:00:00Z",
  },
]

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: "act-1",
    strava_id: 123456789,
    user_id: "user-1",
    display_name: "Morning Run in Dago",
    distance: 9000, // 9km in meters
    moving_time: 3510, // 58:30 in seconds
    elapsed_time: 3600,
    total_elevation_gain: 45.2,
    start_date_local: "2026-01-12T06:00:00Z",
    map_polyline: "a~_fEgmqxMnCwF~BqE|@sB",
    average_speed: 2.56, // m/s
    avg_heart_rate: 158,
    max_heart_rate: 175,
    feeling_scale: 8,
    photo_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5",
    caption: "Great morning run! Feeling energized 💪",
    weight_at_time: 70.5,
    vo2max_estimate: 48.7,
    fitness_impact: "Improving",
    is_personal_best: false,
    is_synced: true,
    created_at: "2026-01-12T06:00:00Z",
  },
  {
    id: "act-2",
    strava_id: 123456788,
    user_id: "user-1",
    display_name: "Evening Jog",
    distance: 6500, // 6.5km
    moving_time: 2415, // 40:15
    elapsed_time: 2500,
    total_elevation_gain: 32.0,
    start_date_local: "2026-01-10T17:30:00Z",
    map_polyline: "b~_fEhmqxMmCvF~AqD|@rB",
    average_speed: 2.69,
    avg_heart_rate: 145,
    max_heart_rate: 162,
    feeling_scale: 7,
    weight_at_time: 71.0,
    vo2max_estimate: 47.8,
    fitness_impact: "Maintaining",
    is_personal_best: false,
    is_synced: true,
    created_at: "2026-01-10T17:30:00Z",
  },
  {
    id: "act-3",
    strava_id: 123456787,
    user_id: "user-1",
    display_name: "Tempo Run",
    distance: 8100, // 8.1km
    moving_time: 3165, // 52:45
    elapsed_time: 3200,
    total_elevation_gain: 58.5,
    start_date_local: "2026-01-08T06:15:00Z",
    map_polyline: "c~_fEimqxMnDwG~CqF|BsC",
    average_speed: 2.56,
    avg_heart_rate: 165,
    max_heart_rate: 178,
    feeling_scale: 9,
    photo_url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8",
    caption: "Pushed hard today! 🔥",
    weight_at_time: 71.5,
    vo2max_estimate: 49.1,
    fitness_impact: "Improving",
    is_personal_best: false,
    is_synced: true,
    created_at: "2026-01-08T06:15:00Z",
  },
  {
    id: "act-4",
    user_id: "user-1",
    display_name: "Recovery Run",
    distance: 5200, // 5.2km
    moving_time: 1860, // 31:00
    elapsed_time: 1920,
    total_elevation_gain: 25.0,
    start_date_local: "2026-01-06T07:00:00Z",
    average_speed: 2.80,
    avg_heart_rate: 138,
    max_heart_rate: 152,
    feeling_scale: 5,
    weight_at_time: 72.0,
    vo2max_estimate: 47.2,
    fitness_impact: "Recovery",
    is_personal_best: false,
    is_synced: false, // Not synced to Strava
    created_at: "2026-01-06T07:00:00Z",
  },
  {
    id: "act-5",
    strava_id: 123456785,
    user_id: "user-1",
    display_name: "Long Run Saturday",
    distance: 15000, // 15km
    moving_time: 5400, // 1:30:00
    elapsed_time: 5500,
    total_elevation_gain: 120.0,
    start_date_local: "2026-01-05T07:00:00Z",
    map_polyline: "d~_fEjmqxMoEwH~DqG|CsD",
    average_speed: 2.78,
    avg_heart_rate: 152,
    max_heart_rate: 168,
    feeling_scale: 8,
    photo_url: "https://images.unsplash.com/photo-1483721310020-03333e577078",
    caption: "Half marathon training! Getting stronger every week 🏃‍♂️",
    weight_at_time: 72.5,
    vo2max_estimate: 48.2,
    fitness_impact: "Building",
    is_personal_best: true,
    is_synced: true,
    created_at: "2026-01-05T07:00:00Z",
  },
  {
    id: "act-6",
    user_id: "user-1",
    display_name: "Interval Training",
    distance: 7000, // 7km
    moving_time: 2700, // 45:00
    elapsed_time: 2850,
    total_elevation_gain: 40.0,
    start_date_local: "2026-01-03T17:00:00Z",
    average_speed: 2.59,
    avg_heart_rate: 170,
    max_heart_rate: 185,
    feeling_scale: 9,
    weight_at_time: 72.5,
    vo2max_estimate: 49.5,
    fitness_impact: "Improving",
    is_personal_best: false,
    is_synced: false,
    created_at: "2026-01-03T17:00:00Z",
  },
]

// Helper function to format pace (min/km)
export function calculatePace(distanceMeters: number, timeSeconds: number): string {
  const distanceKm = distanceMeters / 1000
  const paceSecondsPerKm = timeSeconds / distanceKm
  const minutes = Math.floor(paceSecondsPerKm / 60)
  const seconds = Math.floor(paceSecondsPerKm % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Helper function to format time
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Weekly statistics
export const mockWeeklyStats = {
  totalDistance: 42.1, // km
  totalTime: 17025, // seconds (4h 47m)
  avgHeartRate: 156,
  avgVO2Max: 48.7,
  totalActivities: 6,
  improvementRate: 2.3, // percentage
}

// Chart data for dashboard
export const mockChartData = [
  { date: "Jan 1", distance: 5.2, vo2max: 47.2 },
  { date: "Jan 3", distance: 7.0, vo2max: 49.5 },
  { date: "Jan 5", distance: 15.0, vo2max: 48.2 },
  { date: "Jan 6", distance: 5.2, vo2max: 47.2 },
  { date: "Jan 8", distance: 8.1, vo2max: 49.1 },
  { date: "Jan 10", distance: 6.5, vo2max: 47.8 },
  { date: "Jan 12", distance: 9.0, vo2max: 48.7 },
]
