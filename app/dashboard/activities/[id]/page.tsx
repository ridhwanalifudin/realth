"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  ImageIcon,
  Weight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ActivityDetail {
  id: number
  name: string
  date: string
  distance: number
  time: string
  avgPace: string
  calories: number
  elevation: number
  heartRate: { avg: number; max: number; min: number }
  vo2max: number
  description: string
  photo: string | null
  weight: number
  caption: string
  splits: Array<{ km: string; pace: string; hr: number }>
}

interface UserProfile {
  name: string
  email: string
  age: number
  weight: number
  height: number
  fatPercentage: number
}

// Mock data for detailed activity
const initialActivityDetails: ActivityDetail = {
  id: 1,
  name: "Morning Run",
  date: "Jan 15, 2026",
  distance: 9.0,
  time: "58:30",
  avgPace: "6:26",
  calories: 780,
  elevation: 245,
  heartRate: { avg: 158, max: 175, min: 120 },
  vo2max: 48.2,
  description: "Great morning run with good pace and heart rate control.",
  photo: null,
  weight: 72,
  caption: "Amazing morning run!",
  splits: [
    { km: "1 km", pace: "6:30", hr: 145 },
    { km: "2 km", pace: "6:28", hr: 152 },
    { km: "3 km", pace: "6:26", hr: 158 },
    { km: "4 km", pace: "6:24", hr: 162 },
    { km: "5 km", pace: "6:25", hr: 165 },
    { km: "6 km", pace: "6:27", hr: 168 },
    { km: "7 km", pace: "6:28", hr: 170 },
    { km: "8 km", pace: "6:29", hr: 172 },
    { km: "9 km", pace: "6:26", hr: 162 },
  ],
}

// Heart rate distribution data
const hrDistribution = [
  { zone: "Warm Up", count: 5, range: "120-140 bpm" },
  { zone: "Endurance", count: 15, range: "140-160 bpm" },
  { zone: "Tempo", count: 25, range: "160-180 bpm" },
  { zone: "Max", count: 13, range: "180+ bpm" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

// VO2max calculation functions
const calculateVO2max = (heartRate: number, pace: number, age: number): number => {
  const heartRateReserve = 220 - age - heartRate
  const vo2max = ((heartRateReserve * 15.3) / 10 + 3.5) * 3.5
  return Math.round(vo2max * 10) / 10
}

const calculateFitnessLevel = (vo2max: number): string => {
  if (vo2max >= 50) return "Exceptional"
  if (vo2max >= 45) return "Excellent"
  if (vo2max >= 40) return "Very Good"
  if (vo2max >= 35) return "Good"
  if (vo2max >= 30) return "Average"
  return "Below Average"
}

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const [activityDetails, setActivityDetails] = useState<ActivityDetail>(initialActivityDetails)
  const [profileWeight, setProfileWeight] = useState(72)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    const userProfile = localStorage.getItem("userProfile")
    if (userProfile) {
      const profile: UserProfile = JSON.parse(userProfile)
      setProfileWeight(profile.weight)
      // Set activity weight to profile weight if not already set
      setActivityDetails((prev) => ({
        ...prev,
        weight: prev.weight || profile.weight,
      }))
    }

    const savedActivity = localStorage.getItem(`activity-${params.id}`)
    if (savedActivity) {
      setActivityDetails(JSON.parse(savedActivity))
    }
  }, [params.id])

  const handleInputChange = (field: keyof ActivityDetail, value: string | number) => {
    setActivityDetails((prev) => ({
      ...prev,
      [field]: typeof value === "number" ? Number.parseFloat(value as string) : value,
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setPhotoPreview(base64String)
        handleInputChange("photo", base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    localStorage.setItem(`activity-${params.id}`, JSON.stringify(activityDetails))
    setIsEditing(false)
    setIsSaving(false)
  }

  const fitnessLevel = calculateFitnessLevel(activityDetails.vo2max)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Link
            href="/dashboard/activities"
            className="text-primary hover:underline font-semibold inline-flex items-center gap-2"
          >
            ← Back to Activities
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{activityDetails.name}</h1>
              <p className="text-foreground/70">{activityDetails.date}</p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Edit2 size={18} className="mr-2" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </motion.div>

        {/* Main Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {[
            { label: "Distance", value: `${activityDetails.distance} km`, icon: MapPin },
            { label: "Time", value: activityDetails.time, icon: Clock },
            { label: "Avg Pace", value: activityDetails.avgPace, icon: TrendingUp },
            { label: "Calories", value: activityDetails.calories, icon: Zap },
            { label: "Elevation", value: `${activityDetails.elevation} m`, icon: Activity },
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
          {/* Heart Rate Card */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Heart Rate
            </h2>
            <div className="space-y-4">
              {[
                { label: "Average", value: `${activityDetails.heartRate.avg} bpm`, color: "text-primary" },
                { label: "Maximum", value: `${activityDetails.heartRate.max} bpm`, color: "text-red-500" },
                { label: "Minimum", value: `${activityDetails.heartRate.min} bpm`, color: "text-blue-500" },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-sm text-foreground/70 mb-1">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Fitness Analysis
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70 mb-1">VO2max</p>
                <p className="text-3xl font-bold text-primary">{activityDetails.vo2max}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-1">Fitness Level</p>
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                  {fitnessLevel}
                </span>
              </div>
              {isEditing && (
                <div className="space-y-2 pt-4 border-t border-primary/20">
                  <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                    <Weight size={16} className="text-primary" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={activityDetails.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    step="0.1"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-foreground/70">Default: {profileWeight} kg (from profile)</p>
                </div>
              )}
              {!isEditing && (
                <div className="bg-background/50 border border-border rounded-lg p-3 text-sm text-foreground/70">
                  <p>Your fitness level is {fitnessLevel.toLowerCase()}, indicating strong aerobic capacity.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Energy Expenditure */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Energy & Performance
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70 mb-1">Calories Burned</p>
                <p className="text-2xl font-bold text-foreground">{activityDetails.calories}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-1">Avg Speed</p>
                <p className="text-2xl font-bold text-foreground">
                  {(
                    activityDetails.distance /
                    (Number.parseInt(activityDetails.time.split(":")[0]) +
                      Number.parseInt(activityDetails.time.split(":")[1]) / 60)
                  ).toFixed(1)}{" "}
                  km/h
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {isEditing && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-card border border-border rounded-xl p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Activity Photo
            </h2>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                <label htmlFor="photo-upload" className="cursor-pointer block">
                  <ImageIcon className="w-8 h-8 text-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-foreground/70">Click to upload or drag and drop</p>
                  <p className="text-xs text-foreground/50">PNG, JPG, GIF up to 10MB</p>
                </label>
              </div>
              {(photoPreview || activityDetails.photo) && (
                <div className="relative w-full h-48 bg-background rounded-lg overflow-hidden">
                  <img
                    src={photoPreview || activityDetails.photo || ""}
                    alt="Activity preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setPhotoPreview(null)
                      handleInputChange("photo", "")
                    }}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Activity Notes & Caption
            </h2>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Caption</label>
                <input
                  type="text"
                  value={activityDetails.caption}
                  onChange={(e) => handleInputChange("caption", e.target.value)}
                  placeholder="Add a caption for this activity..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  maxLength={100}
                />
                <p className="text-xs text-foreground/50 mt-1">{activityDetails.caption.length}/100</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <textarea
                  value={activityDetails.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check size={18} className="mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => {
                    setActivityDetails(initialActivityDetails)
                    setPhotoPreview(null)
                    setIsEditing(false)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activityDetails.caption && (
                <div className="p-4 bg-background border border-border rounded-lg">
                  <p className="text-sm font-semibold text-foreground italic">"{activityDetails.caption}"</p>
                </div>
              )}
              <p className="text-foreground/70">{activityDetails.description}</p>
              {activityDetails.photo && (
                <div className="w-full h-64 bg-background rounded-lg overflow-hidden mt-4">
                  <img
                    src={activityDetails.photo || "/placeholder.svg"}
                    alt="Activity photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Split Times Chart */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance Over Distance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityDetails.splits}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(0,0,0,0.1)" vertical={false} />
              <XAxis dataKey="km" stroke="rgb(0,0,0,0.5)" style={{ fontSize: "12px" }} />
              <YAxis stroke="rgb(0,0,0,0.5)" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgb(20, 20, 25)",
                  border: "1px solid rgb(100, 100, 100)",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "white" }}
              />
              <Line type="monotone" dataKey="hr" stroke="rgb(239, 68, 68)" strokeWidth={2} name="Heart Rate (bpm)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Heart Rate Zones */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-card border border-border rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Heart Rate Zones Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hrDistribution.map((zone, i) => (
              <div key={i} className="bg-background border border-border rounded-lg p-4 text-center">
                <p className="text-sm text-foreground/70 mb-2">{zone.zone}</p>
                <p className="text-3xl font-bold text-primary mb-2">{zone.count}%</p>
                <p className="text-xs text-foreground/70">{zone.range}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
