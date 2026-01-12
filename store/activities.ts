import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Activity {
  id: string
  strava_id?: number
  user_id: string
  display_name: string
  distance: number // in meters
  moving_time: number // in seconds
  elapsed_time?: number
  total_elevation_gain?: number
  start_date_local: string
  map_polyline?: string
  average_speed?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  feeling_scale?: number
  photo_url?: string
  caption?: string
  weight_at_time?: number
  vo2max_estimate?: number
  fitness_impact?: string
  is_personal_best?: boolean
  is_synced: boolean
  created_at: string
  updated_at?: string
}

interface PendingMutation {
  id: string
  type: 'create' | 'update' | 'delete'
  activity: Partial<Activity>
  timestamp: number
}

interface ActivitiesState {
  activities: Activity[]
  pendingSync: PendingMutation[]
  selectedActivity: Activity | null
  isLoading: boolean
  lastSync: string | null
  
  // Actions
  setActivities: (activities: Activity[]) => void
  addActivity: (activity: Activity) => void
  updateActivity: (id: string, updates: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  setSelectedActivity: (activity: Activity | null) => void
  
  // Offline sync queue
  queueForSync: (mutation: PendingMutation) => void
  clearSyncQueue: () => void
  removePendingMutation: (id: string) => void
  
  // Utility
  setLoading: (loading: boolean) => void
  setLastSync: (timestamp: string) => void
  getActivityById: (id: string) => Activity | undefined
}

export const useActivitiesStore = create<ActivitiesState>()(
  persist(
    (set, get) => ({
      activities: [],
      pendingSync: [],
      selectedActivity: null,
      isLoading: false,
      lastSync: null,

      setActivities: (activities) => set({ activities }),

      addActivity: (activity) =>
        set((state) => ({
          activities: [activity, ...state.activities].sort(
            (a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime()
          ),
        })),

      updateActivity: (id, updates) =>
        set((state) => ({
          activities: state.activities.map((activity) =>
            activity.id === id ? { ...activity, ...updates, updated_at: new Date().toISOString() } : activity
          ),
        })),

      deleteActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter((activity) => activity.id !== id),
        })),

      setSelectedActivity: (activity) => set({ selectedActivity: activity }),

      queueForSync: (mutation) =>
        set((state) => ({
          pendingSync: [...state.pendingSync, mutation],
        })),

      clearSyncQueue: () => set({ pendingSync: [] }),

      removePendingMutation: (id) =>
        set((state) => ({
          pendingSync: state.pendingSync.filter((mutation) => mutation.id !== id),
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setLastSync: (timestamp) => set({ lastSync: timestamp }),

      getActivityById: (id) => {
        return get().activities.find((activity) => activity.id === id)
      },
    }),
    {
      name: 'realth-activities-storage',
      partialize: (state) => ({
        activities: state.activities,
        pendingSync: state.pendingSync,
        lastSync: state.lastSync,
      }),
    }
  )
)
