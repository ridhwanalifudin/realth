"use client"

import { useRef, useState } from "react"
import { X, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeroCardDialogProps {
  open: boolean
  onClose: () => void
  activity: any
  vo2?: number | null
  level?: string
}

function formatPace(avgSpeedMs: number): string {
  if (!avgSpeedMs) return "—"
  const paceMinPerKm = 1000 / avgSpeedMs / 60
  const paceMin = Math.floor(paceMinPerKm)
  const paceSec = Math.round((paceMinPerKm - paceMin) * 60)
  return `${paceMin}:${paceSec.toString().padStart(2, "0")}`
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

// ── The actual card visual ────────────────────────────────────────────────────
function HeroCard({
  activity,
  vo2,
  level,
  cardRef,
}: {
  activity: any
  vo2?: number | null
  level?: string
  cardRef: React.RefObject<HTMLDivElement>
}) {
  const date = new Date(activity.start_date_local).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  const distanceKm = (activity.distance / 1000).toFixed(2)
  const pace = formatPace(activity.average_speed)
  const time = formatTime(activity.moving_time)
  const elev = activity.total_elevation_gain ? `${Math.round(activity.total_elevation_gain)}m` : null
  const hasHR = !!activity.avg_heart_rate
  const hasPhoto = !!activity.photo_url

  return (
    <div
      ref={cardRef}
      style={{ width: 600, height: 360, fontFamily: "'Inter', 'Helvetica Neue', sans-serif" }}
      className="relative overflow-hidden bg-gray-950 rounded-2xl text-white select-none"
    >
      {/* Background */}
      {hasPhoto ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.photo_url}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.70) 100%)",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #0f172a 100%)",
          }}
        />
      )}

      {/* Decorative accents */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(139,92,246,0.18)", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(59,130,246,0.15)", filter: "blur(35px)" }} />

      {/* Content */}
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", padding: "28px 32px 24px" }}>

        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>R</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,0.85)" }}>REALTH</span>
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{date}</span>
        </div>

        {/* Activity name */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, margin: "0 0 6px", color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
            {activity.display_name}
          </h2>
          {activity.caption && (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontStyle: "italic", margin: "0 0 12px" }}>
              "{activity.caption}"
            </p>
          )}
        </div>

        {/* Main stats row */}
        <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
          {[
            { label: "DISTANCE", value: `${distanceKm}`, unit: "KM" },
            { label: "PACE", value: pace, unit: "/KM" },
            { label: "TIME", value: time, unit: "" },
            ...(elev ? [{ label: "ELEV", value: elev, unit: "" }] : []),
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: -0.5 }}>
                {s.value}
                {s.unit && <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginLeft: 2 }}>{s.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Secondary stats */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {hasHR && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "rgba(239,68,68,0.25)", border: "1px solid rgba(239,68,68,0.4)", color: "#fca5a5" }}>
              ❤ {activity.avg_heart_rate} bpm
            </span>
          )}
          {vo2 && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }}>
              VO2 {vo2.toFixed(1)}
            </span>
          )}
          {level && level !== "—" && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "rgba(59,130,246,0.25)", border: "1px solid rgba(59,130,246,0.4)", color: "#93c5fd" }}>
              {level}
            </span>
          )}
          {activity.feeling_scale && (
            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: "rgba(234,179,8,0.2)", border: "1px solid rgba(234,179,8,0.35)", color: "#fde047" }}>
              ★ Effort {activity.feeling_scale}/10
            </span>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 }}>
            Generated with Realth
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>runner's health tracker</span>
        </div>
      </div>
    </div>
  )
}

// ── Dialog wrapper ─────────────────────────────────────────────────────────────
export default function HeroCardDialog({ open, onClose, activity, vo2, level }: HeroCardDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null!)
  const [downloading, setDownloading] = useState(false)

  if (!open || !activity) return null

  async function handleDownload() {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true })
      const link = document.createElement("a")
      link.download = `${activity.display_name?.replace(/\s+/g, "_") || "hero_card"}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Hero Card download failed:", err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Hero Card</h2>
            <p className="text-sm text-foreground/50 mt-0.5">Download and share your run</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Card preview */}
        <div className="overflow-auto rounded-xl mb-6 flex justify-center">
          <HeroCard activity={activity} vo2={vo2} level={level} cardRef={cardRef} />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {downloading
              ? <><Loader2 size={18} className="mr-2 animate-spin" />Generating…</>
              : <><Download size={18} className="mr-2" />Download PNG</>
            }
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
