import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Strava Webhook Event Handler
 * Responds to activity updates from Strava in real-time
 * 
 * Webhook Events:
 * - create: New activity created
 * - update: Activity updated
 * - delete: Activity deleted
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { aspect_type, object_type, object_id, owner_id, subscription_id, event_time } = body

    // Verify it's an activity event
    if (object_type !== 'activity') {
      return NextResponse.json({ message: 'Event ignored - not an activity' }, { status: 200 })
    }

    const supabase = await createServerSupabaseClient()

    // Find user by Strava athlete ID
    const { data: tokenData } = await supabase
      .from('strava_tokens')
      .select('user_id')
      .eq('strava_athlete_id', owner_id.toString())
      .single()

    if (!tokenData) {
      console.log('User not found for Strava athlete:', owner_id)
      return NextResponse.json({ message: 'User not found' }, { status: 200 })
    }

    // Handle different event types
    switch (aspect_type) {
      case 'create':
        console.log(`New activity created: ${object_id} for user ${tokenData.user_id}`)
        // Queue for background sync
        // In production, you'd trigger a background job here
        break

      case 'update':
        console.log(`Activity updated: ${object_id} for user ${tokenData.user_id}`)
        // Update activity in database if it exists
        break

      case 'delete':
        console.log(`Activity deleted: ${object_id}`)
        // Delete from our database
        await supabase
          .from('activities')
          .delete()
          .eq('strava_id', object_id)
          .eq('user_id', tokenData.user_id)
        break

      default:
        console.log('Unknown event type:', aspect_type)
    }

    return NextResponse.json({ message: 'Event processed' }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Webhook Verification (GET request)
 * Strava sends this to verify the webhook endpoint
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'REALTH_WEBHOOK_2024'

  // Verify the webhook
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully')
    return NextResponse.json({ 'hub.challenge': challenge })
  }

  return NextResponse.json({ error: 'Invalid verification token' }, { status: 403 })
}
