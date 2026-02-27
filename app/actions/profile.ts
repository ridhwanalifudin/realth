'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function updateProfile(profileData: {
  full_name?: string
  age?: number
  gender?: string
  height?: number
  weight?: number
  vo2max?: number
  resting_heart_rate?: number
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', success: false }
    }

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.full_name,
        age: profileData.age,
        gender: profileData.gender,
        height: profileData.height,
        weight: profileData.weight,
        vo2max: profileData.vo2max,
        resting_heart_rate: profileData.resting_heart_rate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message, success: false }
    }

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return { data, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile', success: false }
  }
}

export async function getProfile() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', profile: null }
    }

    // Fetch profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return { error: error.message, profile: null }
    }

    return { profile, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch profile', profile: null }
  }
}

export async function addBiometricRecord(biometricData: {
  weight: number
  body_fat_percentage?: number
  muscle_mass?: number
  source?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', success: false }
    }

    // Insert biometric record
    const { data, error } = await supabase
      .from('biometrics_history')
      .insert({
        user_id: user.id,
        weight: biometricData.weight,
        body_fat_percentage: biometricData.body_fat_percentage,
        muscle_mass: biometricData.muscle_mass,
        source: biometricData.source || 'manual',
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return { error: error.message, success: false }
    }

    // Also update profile with latest weight
    await supabase
      .from('profiles')
      .update({
        weight: biometricData.weight,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard')

    return { data, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to add biometric record', success: false }
  }
}

export async function getBiometricHistory(limit: number = 30) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', records: [] }
    }

    // Fetch biometric history
    const { data: records, error } = await supabase
      .from('biometrics_history')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { error: error.message, records: [] }
    }

    return { records: records || [], success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch biometric history', records: [] }
  }
}
