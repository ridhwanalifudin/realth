import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's activities from database
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date_local', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ activities: activities || [] }, { status: 200 })
  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const data = await request.json()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate required fields
    if (!data.name || !data.distance || !data.elapsed_time) {
      return NextResponse.json(
        { error: 'Name, distance, and elapsed_time are required' },
        { status: 400 }
      )
    }

    // Insert activity into database
    const { data: newActivity, error } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        name: data.name,
        distance: data.distance,
        elapsed_time: data.elapsed_time,
        moving_time: data.moving_time || data.elapsed_time,
        start_date_local: data.start_date_local || new Date().toISOString(),
        type: data.type || 'Run',
        average_speed: data.average_speed,
        max_speed: data.max_speed,
        average_heartrate: data.average_heartrate,
        max_heartrate: data.max_heartrate,
        total_elevation_gain: data.total_elevation_gain,
        calories: data.calories,
        vo2max: data.vo2max,
        map_polyline: data.map_polyline,
        photos: data.photos || [],
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      { activity: newActivity, message: 'Activity created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
