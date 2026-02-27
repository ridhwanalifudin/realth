'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function enrichActivity(activityId: string, enrichmentData: {
  avg_heart_rate?: number
  max_heart_rate?: number
  vo2max_estimate?: number
  photo_url?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Unauthorized', success: false }

    const { data, error } = await supabase
      .from('activities')
      .update({
        ...enrichmentData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', activityId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return { error: error.message, success: false }

    revalidatePath('/dashboard/activities')
    revalidatePath(`/dashboard/activities/${activityId}`)

    return { data, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to enrich activity', success: false }
  }
}

export async function updateActivity(activityId: string, updates: {
  caption?: string
  weight_at_time?: number
  feeling_scale?: number
  photo_url?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Unauthorized', success: false }

    const { data, error } = await supabase
      .from('activities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', activityId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return { error: error.message, success: false }

    revalidatePath('/dashboard/activities')
    revalidatePath(`/dashboard/activities/${activityId}`)

    return { data, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to update activity', success: false }
  }
}

export async function deleteActivity(activityId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', success: false }
    }

    // Delete activity
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message, success: false }
    }

    revalidatePath('/dashboard/activities')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to delete activity', success: false }
  }
}

export async function createActivity(activityData: {
  display_name: string
  distance: number
  elapsed_time: number
  moving_time?: number
  start_date_local: string
  average_speed?: number
  avg_heart_rate?: number
  max_heart_rate?: number
  total_elevation_gain?: number
  vo2max_estimate?: number
  map_polyline?: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Unauthorized', success: false }

    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        ...activityData,
        is_synced: false,
      })
      .select()
      .single()

    if (error) return { error: error.message, success: false }

    revalidatePath('/dashboard/activities')
    revalidatePath('/dashboard')

    return { data, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to create activity', success: false }
  }
}

// Single combined save for everything the enrichment form can touch
export async function saveActivityEnrichment(activityId: string, fields: {
  avg_heart_rate?: number | null
  max_heart_rate?: number | null
  vo2max_estimate?: number | null
  feeling_scale?: number | null
  photo_url?: string | null
  caption?: string | null
  weight_at_time?: number | null
}) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'Unauthorized', success: false }

    // Strip undefined keys so we don't accidentally null-out untouched fields
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) updates[k] = v
    }

    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', activityId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return { error: error.message, success: false }

    revalidatePath('/dashboard/activities')
    revalidatePath(`/dashboard/activities/${activityId}`)
    revalidatePath('/dashboard')

    return { data, success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to save enrichment', success: false }
  }
}

export async function getActivities() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', activities: [] }
    }

    // Fetch activities
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date_local', { ascending: false })

    if (error) {
      return { error: error.message, activities: [] }
    }

    return { activities: activities || [], success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch activities', activities: [] }
  }
}

export async function getActivity(activityId: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', activity: null }
    }

    // Fetch activity
    const { data: activity, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return { error: error.message, activity: null }
    }

    return { activity, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch activity', activity: null }
  }
}
