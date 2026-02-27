'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export interface BiometricEntry {
  id: string
  user_id: string
  weight: number | null
  fat_percentage: number | null
  notes: string | null
  recorded_at: string
  created_at: string
}

export async function logBiometrics(data: {
  weight?: number
  fat_percentage?: number
  notes?: string
  recorded_at?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Unauthorized', success: false }

    const { data: entry, error } = await supabase
      .from('biometrics_history')
      .insert({
        user_id: user.id,
        weight: data.weight || null,
        fat_percentage: data.fat_percentage || null,
        notes: data.notes || null,
        recorded_at: data.recorded_at || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) return { error: error.message, success: false }

    revalidatePath('/dashboard/profile')
    return { data: entry, success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to log biometrics', success: false }
  }
}

export async function getBiometrics(limit = 30): Promise<{ data: BiometricEntry[] | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { data: null, error: 'Unauthorized' }

    const { data, error } = await supabase
      .from('biometrics_history')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: true })
      .limit(limit)

    if (error) return { data: null, error: error.message }
    return { data: data as BiometricEntry[] }
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch biometrics' }
  }
}

export async function deleteBiometricEntry(entryId: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Unauthorized', success: false }

    const { error } = await supabase
      .from('biometrics_history')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id)

    if (error) return { error: error.message, success: false }
    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete entry', success: false }
  }
}
