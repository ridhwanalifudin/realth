'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function saveStravaTokens(tokensData: {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete_id: string
}) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', success: false }
    }

    // Upsert Strava tokens (insert or update if exists)
    const { data, error } = await supabase
      .from('strava_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokensData.access_token,
        refresh_token: tokensData.refresh_token,
        expires_at: new Date(tokensData.expires_at * 1000).toISOString(),
        athlete_id: tokensData.athlete_id,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (error) {
      return { error: error.message, success: false }
    }

    revalidatePath('/dashboard')

    return { data, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to save Strava tokens', success: false }
  }
}

export async function getStravaTokens() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', tokens: null }
    }

    // Fetch Strava tokens
    const { data: tokens, error } = await supabase
      .from('strava_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // No tokens found is not an error, just return null
      if (error.code === 'PGRST116') {
        return { tokens: null, success: true }
      }
      return { error: error.message, tokens: null }
    }

    return { tokens, success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch Strava tokens', tokens: null }
  }
}

export async function refreshStravaToken(refreshToken: string) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', success: false }
    }

    // Call Strava API to refresh token
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      return { error: 'Failed to refresh Strava token', success: false }
    }

    const data = await response.json()

    // Update tokens in database
    const { error } = await supabase
      .from('strava_tokens')
      .update({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(data.expires_at * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message, success: false }
    }

    return { 
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      success: true 
    }
  } catch (error: any) {
    return { error: error.message || 'Failed to refresh Strava token', success: false }
  }
}

export async function disconnectStrava() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', success: false }
    }

    // Delete Strava tokens
    const { error } = await supabase
      .from('strava_tokens')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message, success: false }
    }

    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to disconnect Strava', success: false }
  }
}
