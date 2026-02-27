"use client"

import { useEffect, useState, useCallback } from "react"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useActivitiesStore } from "@/store/activities"

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [justCameOnline, setJustCameOnline] = useState(false)

  const { pendingSync, processSyncQueue } = useActivitiesStore()

  const handleOnline = useCallback(async () => {
    setIsOnline(true)
    setJustCameOnline(true)
    setShowBanner(true)

    // Flush the offline mutation queue
    if (pendingSync.length > 0) {
      setSyncing(true)
      await processSyncQueue()
      setSyncing(false)
    }

    // Auto-hide the "back online" banner after 3s
    setTimeout(() => {
      setShowBanner(false)
      setJustCameOnline(false)
    }, 3000)
  }, [pendingSync, processSyncQueue])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    setShowBanner(true)
  }, [])

  useEffect(() => {
    // Read initial state
    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  if (!showBanner) return null

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold transition-all backdrop-blur-md border ${
        isOnline
          ? "bg-green-500/90 border-green-400/50 text-white"
          : "bg-red-500/90 border-red-400/50 text-white"
      }`}
    >
      {isOnline ? (
        <>
          {syncing
            ? <><RefreshCw size={14} className="animate-spin" /> Syncing {pendingSync.length} pending changes…</>
            : <><Wifi size={14} /> Back online{justCameOnline && pendingSync.length === 0 ? " — all synced!" : ""}</>
          }
        </>
      ) : (
        <>
          <WifiOff size={14} />
          Offline — changes will sync when reconnected
          {pendingSync.length > 0 && (
            <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {pendingSync.length} queued
            </span>
          )}
        </>
      )}
    </div>
  )
}
