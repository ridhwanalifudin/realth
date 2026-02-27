'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Activity, RefreshCw, Link2, Unlink, CheckCircle, AlertCircle } from 'lucide-react'
import { useActivitiesStore } from '@/store/activities'
import { disconnectStrava, getStravaTokens } from '@/app/actions/strava'

interface StravaConnectProps {
  isConnected?: boolean
  onConnectionChange?: () => void
}

export function StravaConnect({ isConnected: initialConnected, onConnectionChange }: StravaConnectProps) {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(initialConnected ?? false)
  const [isLoading, setIsLoading] = useState(initialConnected === undefined)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const { syncFromStrava } = useActivitiesStore()

  // Check connection status on mount if not provided
  useEffect(() => {
    if (initialConnected === undefined) {
      getStravaTokens().then(result => {
        setIsConnected(!!result.tokens)
        setIsLoading(false)
      })
    }
  }, [initialConnected])

  const handleConnect = () => {
    // Redirect to Strava OAuth
    window.location.href = '/api/strava/auth'
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from Strava? This will not delete your existing activities.')) {
      return
    }

    const result = await disconnectStrava()
    if (result.success) {
      setIsConnected(false)
      setSyncMessage({ type: 'success', text: 'Disconnected from Strava' })
      onConnectionChange?.()
      router.refresh()
    } else {
      setSyncMessage({ type: 'error', text: result.error || 'Failed to disconnect' })
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncMessage(null)

    const result = await syncFromStrava()

    if (result.success) {
      setSyncMessage({ 
        type: 'success', 
        text: `Successfully synced ${result.syncedCount || 0} activities` 
      })
      onConnectionChange?.()
      router.refresh()
    } else {
      setSyncMessage({ 
        type: 'error', 
        text: result.error || 'Failed to sync activities' 
      })
    }

    setIsSyncing(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#FC4C02]/10">
            <Activity className="w-6 h-6 text-[#FC4C02]" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Strava Integration</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading 
                ? 'Checking connection status...'
                : isConnected 
                  ? 'Sync your runs automatically from Strava' 
                  : 'Connect your Strava account to import activities'
              }
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {isLoading ? (
            <Button disabled variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </Button>
          ) : isConnected ? (
            <>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="ghost"
                size="sm"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              className="bg-[#FC4C02] hover:bg-[#E34402] text-white"
              size="sm"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Connect Strava
            </Button>
          )}
        </div>
      </div>

      {syncMessage && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
          syncMessage.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {syncMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <p className="text-sm">{syncMessage.text}</p>
        </div>
      )}

      {isConnected && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 Tip: Activities are automatically synced when you connect. Click "Sync Now" to manually fetch the latest activities.
          </p>
        </div>
      )}
    </Card>
  )
}
