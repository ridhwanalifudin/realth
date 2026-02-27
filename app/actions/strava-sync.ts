'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getStravaTokens, refreshStravaToken } from './strava'
import { calculateVO2Max } from '@/lib/utils/vo2max'

interface StravaActivity {
  id: number
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  start_date_local: string
  average_speed: number
  max_speed: number
  average_heartrate?: number
  max_heartrate?: number
  map: {
    summary_polyline?: string
  }
}

async function getValidAccessToken(): Promise<string | null> {
  const tokensResult = await getStravaTokens()
  
  if (!tokensResult.tokens) {
    return null
  }

  const { access_token, refresh_token, expires_at } = tokensResult.tokens
  const expiresAt = new Date(expires_at)
  
  // Check if token is expired or will expire in next 5 minutes
  if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
    // Refresh the token
    const refreshResult = await refreshStravaToken(refresh_token)
    if (refreshResult.success && refreshResult.accessToken) {
      return refreshResult.accessToken
    }
    return null
  }

  return access_token
}

export async function syncStravaActivities() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', success: false }
    }

    // Get valid access token
    const accessToken = await getValidAccessToken()
    
    if (!accessToken) {
      return { error: 'Strava not connected or token expired', success: false }
    }

    // Fetch activities from Strava (last 30 activities)
    const response = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=30',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      return { error: 'Failed to fetch Strava activities', success: false }
    }

    const stravaActivities: StravaActivity[] = await response.json()

    // Filter only running activities
    const runningActivities = stravaActivities.filter(
      (activity) => activity.type === 'Run'
    )

    console.log(`Fetched ${stravaActivities.length} total activities from Strava`)
    console.log(`Found ${runningActivities.length} running activities`)
    
    if (stravaActivities.length > 0 && runningActivities.length === 0) {
      const activityTypes = stravaActivities.map(a => a.type).join(', ')
      console.log(`Activity types found: ${activityTypes}`)
      return { 
        error: `No running activities found. You have: ${activityTypes}. Only "Run" activities are synced.`, 
        success: false,
        totalFetched: stravaActivities.length,
        syncedCount: 0,
        skippedCount: stravaActivities.length
      }
    }

    let syncedCount = 0
    let skippedCount = 0

    // Sync each activity to database
    for (const activity of runningActivities) {
      // Check if activity already exists
      const { data: existingActivity } = await supabase
        .from('activities')
        .select('id, avg_heart_rate')
        .eq('strava_id', activity.id)
        .eq('user_id', user.id)
        .single()

      if (existingActivity) {
        // If it exists but has no HR data, backfill it
        if (existingActivity.avg_heart_rate === null && activity.average_heartrate) {
          // Still need VO2Max for update
          const { data: profile } = await supabase
            .from('profiles')
            .select('age, current_vo2max_avg')
            .eq('id', user.id)
            .single()

          const vo2maxUpdate = calculateVO2Max({
            age: profile?.age || 30,
            weight: 70,
            restingHeartRate: 60,
            averageHeartRate: activity.average_heartrate,
            maxHeartRate: activity.max_heartrate,
          })

          await supabase
            .from('activities')
            .update({
              avg_heart_rate: Math.round(activity.average_heartrate),
              max_heart_rate: activity.max_heartrate ? Math.round(activity.max_heartrate) : null,
              vo2max_estimate: vo2maxUpdate,
            })
            .eq('id', existingActivity.id)

          syncedCount++
        } else {
          skippedCount++
        }
        continue
      }

      // Get user profile for VO2Max calculation
      const { data: profile } = await supabase
        .from('profiles')
        .select('age, current_vo2max_avg')
        .eq('id', user.id)
        .single()

      // Calculate VO2Max if heart rate data is available
      let vo2max = null
      if (activity.average_heartrate) {
        vo2max = calculateVO2Max({
          age: profile?.age || 30,
          weight: 70,
          restingHeartRate: 60,
          averageHeartRate: activity.average_heartrate,
          maxHeartRate: activity.max_heartrate,
        })
      }

      // Insert activity
      const { error: insertError } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          strava_id: activity.id,
          display_name: activity.name,
          distance: activity.distance,
          moving_time: activity.moving_time,
          elapsed_time: activity.elapsed_time,
          total_elevation_gain: activity.total_elevation_gain,
          start_date_local: activity.start_date_local,
          average_speed: activity.average_speed,
          avg_heart_rate: activity.average_heartrate ? Math.round(activity.average_heartrate) : null,
          max_heart_rate: activity.max_heartrate ? Math.round(activity.max_heartrate) : null,
          map_polyline: activity.map?.summary_polyline,
          vo2max_estimate: vo2max,
          is_synced: true,
        })

      if (insertError) {
        console.error('Insert error for activity', activity.id, ':', insertError.message)
      } else {
        syncedCount++
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/activities')

    return {
      success: true,
      syncedCount,
      skippedCount,
      totalFetched: runningActivities.length,
    }
  } catch (error: any) {
    console.error('Strava sync error:', error)
    return { error: error.message || 'Failed to sync activities', success: false }
  }
}

export async function fetchStravaActivity(stravaId: number) {
  try {
    const accessToken = await getValidAccessToken()
    
    if (!accessToken) {
      return { error: 'Strava not connected', activity: null }
    }

    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${stravaId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      return { error: 'Failed to fetch activity', activity: null }
    }

    const activity = await response.json()
    return { activity, success: true }
  } catch (error: any) {
    return { error: error.message, activity: null }
  }
}

export async function uploadToStrava(activityId: string, enrichmentData: {
  description?: string
  photos?: string[]
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', success: false }
    }

    // Get activity from database
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('strava_id, name')
      .eq('id', activityId)
      .eq('user_id', user.id)
      .single()

    if (activityError || !activity || !activity.strava_id) {
      return { error: 'Activity not found or not synced with Strava', success: false }
    }

    const accessToken = await getValidAccessToken()
    
    if (!accessToken) {
      return { error: 'Strava not connected', success: false }
    }

    // Update activity description on Strava
    if (enrichmentData.description) {
      const updateResponse = await fetch(
        `https://www.strava.com/api/v3/activities/${activity.strava_id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: enrichmentData.description,
          }),
        }
      )

      if (!updateResponse.ok) {
        return { error: 'Failed to update Strava activity', success: false }
      }
    }

    // Note: Photo upload to Strava requires multipart/form-data
    // This would need additional implementation for direct photo upload

    return { success: true }
  } catch (error: any) {
    console.error('Upload to Strava error:', error)
    return { error: error.message || 'Failed to upload to Strava', success: false }
  }
}
