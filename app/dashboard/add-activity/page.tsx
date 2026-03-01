"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Plus, Calendar, MapPin, Clock, Heart, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createActivity } from "@/app/actions/activities"
import { computeVO2Max } from "@/lib/fitness"

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
} as const

export default function AddActivityPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    distance: "",
    time: "",
    heartRateAvg: "",
    heartRateMax: "",
    notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    // Parse time mm:ss into seconds
    const [mm, ss] = formData.time.split(":").map(Number)
    const totalSeconds = (mm || 0) * 60 + (ss || 0)

    // Distance km → meters
    const distanceM = parseFloat(formData.distance) * 1000

    const avgHR = formData.heartRateAvg ? parseInt(formData.heartRateAvg) : undefined
    const maxHR = formData.heartRateMax ? parseInt(formData.heartRateMax) : undefined
    const vo2 = avgHR ? computeVO2Max(avgHR, maxHR ?? null) : undefined
    const avgSpeed = totalSeconds > 0 ? distanceM / totalSeconds : undefined

    const result = await createActivity({
      display_name: formData.name,
      distance: distanceM,
      elapsed_time: totalSeconds,
      moving_time: totalSeconds,
      start_date_local: new Date(formData.date).toISOString(),
      average_speed: avgSpeed,
      avg_heart_rate: avgHR,
      max_heart_rate: maxHR,
      vo2max_estimate: vo2,
    })

    if (result.success) {
      router.push("/dashboard/activities")
    } else {
      setError(result.error || "Failed to save activity")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Add Activity</h1>
          <p className="text-foreground/70">Log a new running activity manually</p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } } as const}
          initial="hidden"
          animate="visible"
          className="bg-card border border-border rounded-xl p-8 space-y-6"
        >
          {/* Activity Name */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Activity Name</label>
            <Input
              type="text"
              name="name"
              placeholder="e.g., Morning Run, Evening Jog"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </motion.div>

          {/* Date */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar size={16} className="text-primary" />
              Date
            </label>
            <Input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </motion.div>

          {/* Distance & Time */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin size={16} className="text-primary" />
                Distance (km)
              </label>
              <Input
                type="number"
                name="distance"
                placeholder="0.0"
                step="0.1"
                value={formData.distance}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock size={16} className="text-primary" />
                Time (hh:mm)
              </label>
              <Input
                type="text"
                name="time"
                placeholder="00:00"
                pattern="[0-9]{2}:[0-9]{2}"
                value={formData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </motion.div>

          {/* Heart Rate */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Heart size={16} className="text-red-500" />
                Avg Heart Rate (bpm)
              </label>
              <Input
                type="number"
                name="heartRateAvg"
                placeholder="150"
                value={formData.heartRateAvg}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Heart size={16} className="text-red-500" />
                Max Heart Rate (bpm)
              </label>
              <Input
                type="number"
                name="heartRateMax"
                placeholder="180"
                value={formData.heartRateMax}
                onChange={handleInputChange}
                required
              />
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div variants={itemVariants} className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Notes</label>
            <textarea
              name="notes"
              placeholder="Add any notes about your activity..."
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary resize-none"
              rows={4}
            />
          </motion.div>

          {/* Submit Buttons */}
          <motion.div variants={itemVariants} className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Plus size={18} className="mr-2" />}
              {isSubmitting ? "Saving…" : "Add Activity"}
            </Button>
            <Link href="/dashboard/activities" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
          </motion.div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </motion.form>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-primary/5 border border-primary/20 rounded-xl p-4"
        >
          <p className="text-sm text-foreground/70">
            Tip: You can also import activities from Strava directly when that integration becomes available.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
