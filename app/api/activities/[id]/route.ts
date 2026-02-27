import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id } = await params

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch activity from database
    const { data: activity, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ activity }, { status: 200 })
  } catch (error) {
    console.error('Get activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id } = await params

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete activity from database
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json(
      { message: 'Activity deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { id } = await params
    const data = await request.json()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update activity in database
    const { data: updatedActivity, error } = await supabase
      .from('activities')
      .update({
        name: data.name,
        distance: data.distance,
        elapsed_time: data.elapsed_time,
        moving_time: data.moving_time,
        average_speed: data.average_speed,
        max_speed: data.max_speed,
        average_heartrate: data.average_heartrate,
        max_heartrate: data.max_heartrate,
        total_elevation_gain: data.total_elevation_gain,
        calories: data.calories,
        vo2max: data.vo2max,
        photos: data.photos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !updatedActivity) {
      return NextResponse.json(
        { error: 'Activity not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { activity: updatedActivity, message: 'Activity updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update activity error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
