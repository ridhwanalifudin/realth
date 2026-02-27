import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getActivities, createActivity, enrichActivity, deleteActivity as deleteActivityAction } from '@/app/actions/activities'
import { syncStravaActivities } from '@/app/actions/strava-sync'

export interface Activity {
  id: string
  strava_id?: number
  user_id: string
  display_name: string
  name?: string // alias for display_name, kept for compatibility
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
  
  // Supabase sync actions
  fetchActivities: () => Promise<void>
  createActivityInDB: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>
  enrichActivityInDB: (id: string, enrichment: {
    average_heartrate?: number
    max_heartrate?: number
    calories?: number
    vo2max?: number
    photos?: string[]
  }) => Promise<void>
  deleteActivityInDB: (id: string) => Promise<void>
  
  // Offline sync queue
  queueForSync: (mutation: PendingMutation) => void
  clearSyncQueue: () => void
  removePendingMutation: (id: string) => void
  processSyncQueue: () => Promise<void>
  
  // Strava sync actions
  syncFromStrava: () => Promise<{ success: boolean; syncedCount?: number; error?: string }>
  
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

      // Supabase sync actions
      fetchActivities: async () => {
        set({ isLoading: true })
        try {
          const result = await getActivities()
          if (result.success && result.activities) {
            set({ 
              activities: result.activities as Activity[],
              lastSync: new Date().toISOString()
            })
          }
        } catch (error) {
          console.error('Failed to fetch activities:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      createActivityInDB: async (activityData) => {
        set({ isLoading: true })
        try {
          const result = await createActivity({
            name: activityData.name,
            distance: activityData.distance,
            elapsed_time: activityData.elapsed_time,
            moving_time: activityData.moving_time,
            start_date_local: activityData.start_date_local,
            type: activityData.type,
            average_speed: activityData.average_speed,
            max_speed: activityData.max_speed,
            average_heartrate: activityData.average_heartrate,
            max_heartrate: activityData.max_heartrate,
            total_elevation_gain: activityData.total_elevation_gain,
            calories: activityData.calories,
            vo2max: activityData.vo2max,
            map_polyline: activityData.map_polyline,
            photos: activityData.photos,
          })

          if (result.success && result.data) {
            get().addActivity({ ...result.data, is_synced: true } as Activity)
          } else {
            // Queue for later sync if offline
            get().queueForSync({
              id: crypto.randomUUID(),
              type: 'create',
              activity: activityData,
              timestamp: Date.now(),
            })
          }
        } catch (error) {
          console.error('Failed to create activity:', error)
          // Queue for offline sync
          get().queueForSync({
            id: crypto.randomUUID(),
            type: 'create',
            activity: activityData,
            timestamp: Date.now(),
          })
        } finally {
          set({ isLoading: false })
        }
      },

      enrichActivityInDB: async (id, enrichment) => {
        set({ isLoading: true })
        try {
          const result = await enrichActivity(id, enrichment)
          
          if (result.success && result.data) {
            get().updateActivity(id, { ...enrichment, is_synced: true })
          } else {
            // Queue for later sync
            get().queueForSync({
              id: crypto.randomUUID(),
              type: 'update',
              activity: { id, ...enrichment },
              timestamp: Date.now(),
            })
          }
        } catch (error) {
          console.error('Failed to enrich activity:', error)
          // Queue for offline sync
          get().queueForSync({
            id: crypto.randomUUID(),
            type: 'update',
            activity: { id, ...enrichment },
            timestamp: Date.now(),
          })
        } finally {
          set({ isLoading: false })
        }
      },

      deleteActivityInDB: async (id) => {
        set({ isLoading: true })
        try {
          const result = await deleteActivityAction(id)
          
          if (result.success) {
            get().deleteActivity(id)
          } else {
            // Queue for later sync
            get().queueForSync({
              id: crypto.randomUUID(),
              type: 'delete',
              activity: { id },
              timestamp: Date.now(),
            })
          }
        } catch (error) {
          console.error('Failed to delete activity:', error)
          // Queue for offline sync
          get().queueForSync({
            id: crypto.randomUUID(),
            type: 'delete',
            activity: { id },
            timestamp: Date.now(),
          })
        } finally {
          set({ isLoading: false })
        }
      },

      processSyncQueue: async () => {
        const queue = get().pendingSync
        if (queue.length === 0) return

        for (const mutation of queue) {
          try {
            switch (mutation.type) {
              case 'create':
                if (mutation.activity.name && mutation.activity.distance && mutation.activity.elapsed_time) {
                  await createActivity({
                    name: mutation.activity.name,
                    distance: mutation.activity.distance,
                    elapsed_time: mutation.activity.elapsed_time,
                    moving_time: mutation.activity.moving_time || mutation.activity.elapsed_time,
                    start_date_local: mutation.activity.start_date_local || new Date().toISOString(),
                    type: mutation.activity.type,
                    average_speed: mutation.activity.average_speed,
                    max_speed: mutation.activity.max_speed,
                    average_heartrate: mutation.activity.average_heartrate,
                    max_heartrate: mutation.activity.max_heartrate,
                    total_elevation_gain: mutation.activity.total_elevation_gain,
                    calories: mutation.activity.calories,
                    vo2max: mutation.activity.vo2max,
                    map_polyline: mutation.activity.map_polyline,
                    photos: mutation.activity.photos,
                  })
                }
                break

              case 'update':
                if (mutation.activity.id) {
                  await enrichActivity(mutation.activity.id, {
                    average_heartrate: mutation.activity.average_heartrate,
                    max_heartrate: mutation.activity.max_heartrate,
                    calories: mutation.activity.calories,
                    vo2max: mutation.activity.vo2max,
                    photos: mutation.activity.photos,
                  })
                }
                break

              case 'delete':
                if (mutation.activity.id) {
                  await deleteActivityAction(mutation.activity.id)
                }
                break
            }
            
            // Remove successful mutation from queue
            get().removePendingMutation(mutation.id)
          } catch (error) {
            console.error('Failed to process sync mutation:', error)
            // Keep in queue for next sync attempt
          }
        }
      },

      queueForSync: (mutation) =>
        set((state) => ({
          pendingSync: [...state.pendingSync, mutation],
        })),

      clearSyncQueue: () => set({ pendingSync: [] }),

      removePendingMutation: (id) =>
        set((state) => ({
          pendingSync: state.pendingSync.filter((mutation) => mutation.id !== id),
        })),

      // Strava sync
      syncFromStrava: async () => {
        set({ isLoading: true })
        try {
          const result = await syncStravaActivities()
          
          if (result.success) {
            // Refresh activities from database after sync
            await get().fetchActivities()
            return {
              success: true,
              syncedCount: result.syncedCount
            }
          }
          
          return {
            success: false,
            error: result.error
          }
        } catch (error: any) {
          console.error('Strava sync error:', error)
          return {
            success: false,
            error: error.message || 'Failed to sync from Strava'
          }
        } finally {
          set({ isLoading: false })
        }
      },

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
