import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI || 
    `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/callback`

  if (!clientId) {
    return NextResponse.json(
      { error: 'Strava Client ID not configured' },
      { status: 500 }
    )
  }

  // Build Strava OAuth authorization URL
  const authUrl = new URL('https://www.strava.com/oauth/authorize')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'read,activity:read,activity:write')
  authUrl.searchParams.set('approval_prompt', 'auto')

  // Redirect user to Strava OAuth page
  return NextResponse.redirect(authUrl.toString())
}
