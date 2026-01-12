import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  age?: number
  height?: number // in cm
  gender?: 'male' | 'female' | 'other'
  weight_goal?: number
  current_vo2max_avg?: number
  fitness_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite'
  created_at: string
  updated_at?: string
}

export interface BiometricRecord {
  id: string
  user_id: string
  weight: number // in kg
  fat_percentage?: number
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

      getCurrentWeight: () => {
        const latest = get().biometrics[0]
        return latest ? latest.weight : null
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
