"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import {
  Activity,
  Heart,
  TrendingUp,
  MapPin,
  Clock,
  Zap,
  FileText,
  Edit2,
  Check,
  X,
  Weight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getActivity, updateActivity, enrichActivity } from "@/app/actions/activities"

// --- helpers ---
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatPace(avgSpeedMs: number): string {
  if (!avgSpeedMs || avgSpeedMs === 0) return "N/A"
  const paceMinPerKm = 1000 / avgSpeedMs / 60
  const paceMin = Math.floor(paceMinPerKm)
  const paceSec = Math.round((paceMinPerKm - paceMin) * 60)
  return `${paceMin}:${paceSec.toString().padStart(2, "0")}`
}

function fitnessLevel(vo2: number | null | undefined): string {
  if (!vo2) return "—"
  if (vo2 >= 50) return "Exceptional"
  if (vo2 >= 45) return "Excellent"
  if (vo2 >= 40) return "Very Good"
  if (vo2 >= 35) return "Good"
  if (vo2 >= 30) return "Average"
  return "Below Average"
}


// Client-side VO2Max (HR Reserve method, matches server formula)
function computeVO2Max(avgHR: number, maxHR: number | null, age = 30, restingHR = 60): number {
  const mhr = maxHR || (220 - age)
  const hrr = mhr - restingHR
  const workingHR = avgHR - restingHR
  const ratio = workingHR / hrr
  let vo2 = 15.3 * (mhr / restingHR)
  vo2 = vo2 * (0.7 + ratio * 0.3)
  if (age > 25) vo2 = vo2 * (1 - (age - 25) * 0.01)
  return Math.round(vo2 * 10) / 10
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [caption, setCaption] = useState("")
  const [weight, setWeight] = useState<number | "">("")
  const [savingVo2, setSavingVo2] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { activity: data, error } = await getActivity(id)
      if (error || !data) {
        setNotFound(true)
      } else {
        setActivity(data)
        setCaption(data.caption || "")
        setWeight(data.weight_at_time || "")
      }
      setLoading(false)
    })()
  }, [id])

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateActivity(id, {
      caption: caption || undefined,
      weight_at_time: weight ? Number(weight) : undefined,
    })
    if (result.success && result.data) {
      setActivity(result.data)
    }
    setIsEditing(false)
    setIsSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (notFound || !activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl font-semibold text-foreground/70">Activity not found</p>
        <Link href="/dashboard/activities">
          <Button variant="outline">← Back to Activities</Button>
        </Link>
      </div>
    )
  }

  const distanceKm = (activity.distance / 1000).toFixed(2)
  const speedKmh = activity.average_speed ? (activity.average_speed * 3.6).toFixed(1) : "—"
  const vo2 = activity.vo2max_estimate
    || (activity.avg_heart_rate
      ? computeVO2Max(activity.avg_heart_rate, activity.max_heart_rate)
      : null)
  const vo2FromDB = !!activity.vo2max_estimate
  const level = fitnessLevel(vo2)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link href="/dashboard/activities" className="text-primary hover:underline font-semibold inline-flex items-center gap-2">
            ← Back to Activities
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{activity.display_name}</h1>
              <p className="text-foreground/70">
                {new Date(activity.start_date_local).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            <Button
              onClick={() => {
                if (isEditing) { setCaption(activity.caption || ""); setWeight(activity.weight_at_time || "") }
                setIsEditing(!isEditing)
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit2 size={18} className="mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </motion.div>

        {/* Main Stats */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Distance", value: `${distanceKm} km`, icon: MapPin },
            { label: "Time", value: formatTime(activity.moving_time), icon: Clock },
            { label: "Avg Pace", value: `${formatPace(activity.average_speed)} /km`, icon: TrendingUp },
            { label: "Avg Speed", value: `${speedKmh} km/h`, icon: Zap },
            { label: "Elevation", value: activity.total_elevation_gain ? `${Math.round(activity.total_elevation_gain)} m` : "—", icon: Activity },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div key={i} variants={itemVariants} className="bg-card border border-border rounded-lg p-4">
                <Icon className="w-5 h-5 text-primary mb-2" />
                <p className="text-xs text-foreground/70 mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Heart Rate */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Heart Rate
            </h2>
            {activity.avg_heart_rate ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Average</p>
                  <p className="text-2xl font-bold text-primary">{activity.avg_heart_rate} bpm</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Maximum</p>
                  <p className="text-2xl font-bold text-red-500">
                    {activity.max_heart_rate ? `${activity.max_heart_rate} bpm` : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Heart className="w-10 h-10 mx-auto mb-3 text-foreground/20" />
                <p className="text-sm text-foreground/50">No heart rate data.<br />Wear a monitor next time!</p>
              </div>
            )}
          </motion.div>

          {/* Fitness Analysis */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-linear-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Fitness Analysis
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70 mb-1">VO2max estimate</p>
                {vo2 ? (
                  <>
                    <p className="text-3xl font-bold text-primary">{vo2.toFixed(1)}</p>
                    {!vo2FromDB && (
                      <button
                        onClick={async () => {
                          setSavingVo2(true)
                          const res = await enrichActivity(id, { vo2max_estimate: vo2 })
                          if (res.success && res.data) setActivity(res.data)
                          setSavingVo2(false)
                        }}
                        disabled={savingVo2}
                        className="mt-2 text-xs text-primary underline hover:no-underline disabled:opacity-50"
                      >
                        {savingVo2 ? "Saving…" : "Save to profile"}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-foreground/50 py-1">Requires heart rate data to calculate.<br />Sync after a run with HR monitor.</p>
                )}
              </div>
              {vo2 && (
                <>
                  <div>
                    <p className="text-sm text-foreground/70 mb-1">Fitness Level</p>
                    <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">{level}</span>
                  </div>
                  <div className="bg-background/50 border border-border rounded-lg p-3 text-sm text-foreground/70">
                    Your fitness level is {level.toLowerCase()}, indicating strong aerobic capacity.
                  </div>
                </>
              )}
              {isEditing && (
                <div className="space-y-2 pt-4 border-t border-primary/20">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Weight size={16} className="text-primary" />
                    Weight at time (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : "")}
                    step="0.1"
                    placeholder="e.g. 70.5"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Performance */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Performance
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70 mb-1">Avg Speed</p>
                <p className="text-2xl font-bold text-foreground">{speedKmh} km/h</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-1">Avg Pace</p>
                <p className="text-2xl font-bold text-foreground">{formatPace(activity.average_speed)} /km</p>
              </div>
              {activity.weight_at_time && (
                <div>
                  <p className="text-sm text-foreground/70 mb-1">Weight at time</p>
                  <p className="text-2xl font-bold text-foreground">{activity.weight_at_time} kg</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Notes / Caption */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Activity Notes & Caption
          </h2>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption for this activity…"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  maxLength={100}
                />
                <p className="text-xs text-foreground/50 mt-1">{caption.length}/100</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  {isSaving ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Check size={18} className="mr-2" />}
                  {isSaving ? "Saving…" : "Save"}
                </Button>
                <Button
                  onClick={() => { setIsEditing(false); setCaption(activity.caption || ""); setWeight(activity.weight_at_time || "") }}
                  variant="outline"
                  className="flex-1"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {activity.caption ? (
                <div className="p-4 bg-background border border-border rounded-lg">
                  <p className="text-sm font-semibold text-foreground italic">"{activity.caption}"</p>
                </div>
              ) : (
                <p className="text-sm text-foreground/50 italic">No caption yet — click Edit to add one.</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

