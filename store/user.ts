import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getProfile, updateProfile as updateProfileAction, addBiometricRecord, getBiometricHistory } from '@/app/actions/profile'

export interface UserProfile {
  id: string
  user_id: string
  email?: string
  full_name?: string
  age?: number
  height?: number // in cm
  weight?: number // in kg
  gender?: string
  vo2max?: number
  resting_heart_rate?: number
  created_at: string
  updated_at?: string
}

export interface BiometricRecord {
  id: string
  user_id: string
  weight: number // in kg
  body_fat_percentage?: number
  muscle_mass?: number
  source?: string
  recorded_at: string
}

interface UserState {
  user: UserProfile | null
  biometrics: BiometricRecord[]
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: UserProfile | null) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  addBiometric: (record: BiometricRecord) => void
  setBiometrics: (records: BiometricRecord[]) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  
  // Supabase sync actions
  fetchProfile: () => Promise<void>
  updateProfileInDB: (updates: Partial<UserProfile>) => Promise<void>
  addBiometricInDB: (data: {
    weight: number
    body_fat_percentage?: number
    muscle_mass?: number
    source?: string
  }) => Promise<void>
  fetchBiometrics: (limit?: number) => Promise<void>
  
  // Computed
  getCurrentWeight: () => number | null
  getWeightHistory: (days: number) => BiometricRecord[]
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      biometrics: [],
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...updates, updated_at: new Date().toISOString() }
            : null,
        })),

      addBiometric: (record) =>
        set((state) => ({
          biometrics: [record, ...state.biometrics].sort(
            (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
          ),
        })),

      setBiometrics: (records) => set({ biometrics: records }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          biometrics: [],
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Supabase sync actions
      fetchProfile: async () => {
        set({ isLoading: true })
        try {
          const result = await getProfile()
          if (result.success && result.profile) {
            set({ 
              user: result.profile as UserProfile,
              isAuthenticated: true
            })
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      updateProfileInDB: async (updates) => {
        set({ isLoading: true })
        try {
          const result = await updateProfileAction({
            full_name: updates.full_name,
            age: updates.age,
            gender: updates.gender,
            height: updates.height,
            weight: updates.weight,
            vo2max: updates.vo2max,
            resting_heart_rate: updates.resting_heart_rate,
          })

          if (result.success && result.data) {
            get().updateProfile(result.data as Partial<UserProfile>)
          }
        } catch (error) {
          console.error('Failed to update profile:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      addBiometricInDB: async (data) => {
        set({ isLoading: true })
        try {
          const result = await addBiometricRecord(data)

          if (result.success && result.data) {
            get().addBiometric(result.data as BiometricRecord)
            // Also update profile with latest weight
            if (get().user) {
              get().updateProfile({ weight: data.weight })
            }
          }
        } catch (error) {
          console.error('Failed to add biometric record:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      fetchBiometrics: async (limit = 30) => {
        set({ isLoading: true })
        try {
          const result = await getBiometricHistory(limit)
          if (result.success && result.records) {
            set({ biometrics: result.records as BiometricRecord[] })
          }
        } catch (error) {
          console.error('Failed to fetch biometric history:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      getCurrentWeight: () => {
        const latest = get().biometrics[0]
        return latest ? latest.weight : get().user?.weight || null
      },

      getWeightHistory: (days) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        
        return get().biometrics.filter(
          (record) => new Date(record.recorded_at) >= cutoffDate
        )
      },
    }),
    {
      name: 'realth-user-storage',
      partialize: (state) => ({
        user: state.user,
        biometrics: state.biometrics,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
