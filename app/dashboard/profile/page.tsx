"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Calendar, Weight, Weight as Height, Zap, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  full_name: string
  email: string
  age: number
  weight: number
  height: number
  fat_percentage: number
}

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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    email: "",
    age: 0,
    weight: 0,
    height: 0,
    fat_percentage: 0,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [savedMessage, setSavedMessage] = useState("")
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: user.email || "",
          age: data.age || 0,
          weight: data.weight || 0,
          height: data.height || 0,
          fat_percentage: data.fat_percentage || 0,
        })
      } else {
        setProfile(prev => ({ ...prev, email: user.email || "" }))
      }
      setIsLoading(false)
    })()
  }, [])

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setProfile((prev) => ({
      ...prev,
      [field]: field === 'full_name' || field === 'email' ? value : (value === '' ? 0 : parseFloat(String(value))),
    }))
  }

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: profile.full_name,
      age: profile.age || null,
      weight: profile.weight || null,
      height: profile.height || null,
      fat_percentage: profile.fat_percentage || null,
    })
    if (error) {
      setSavedMessage(`Error: ${error.message}`)
      setIsSaving(false)
      return
    }
    setSavedMessage("Profile updated successfully!")
    setIsEditing(false)
    setIsSaving(false)
    setTimeout(() => setSavedMessage(""), 3000)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Profile Settings</h1>
          <p className="text-foreground/70">Manage your personal information and preferences</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (<>

        {/* Success Message */}
        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`px-4 py-3 rounded-lg mb-6 font-medium border ${savedMessage.startsWith("Error:") ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400" : "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"}`}
          >
            {savedMessage}
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-card border border-border rounded-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{profile.full_name || 'Runner'}</h2>
                <p className="text-foreground/70">{profile.email}</p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[
                  { label: "Full Name", value: profile.full_name, field: "full_name", icon: User },
                  { label: "Email", value: profile.email, field: "email", icon: Mail },
                  { label: "Age", value: profile.age, field: "age", icon: Calendar },
                  { label: "Height (cm)", value: profile.height, field: "height", icon: Height },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.div key={item.field} variants={itemVariants} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Icon size={16} className="text-primary" />
                        {item.label}
                      </label>
                      {isEditing ? (
                        <Input
                          value={item.value}
                          onChange={(e) => handleInputChange(item.field as keyof UserProfile, e.target.value)}
                          className="w-full"
                          disabled={item.field === "email"}
                        />
                      ) : (
                        <p className="text-foreground font-semibold text-lg">{item.value}</p>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>

            {/* Health Metrics */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Health Metrics</h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[
                  { label: "Weight (kg)", value: profile.weight, field: "weight", icon: Weight },
                  { label: "Body Fat %", value: profile.fat_percentage, field: "fat_percentage", icon: Zap },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.div key={item.field} variants={itemVariants} className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Icon size={16} className="text-primary" />
                        {item.label}
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={item.value}
                          onChange={(e) => handleInputChange(item.field as keyof UserProfile, e.target.value)}
                          className="w-full"
                          step="0.1"
                        />
                      ) : (
                        <p className="text-foreground font-semibold text-lg">{item.value}</p>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 border-t border-border"
              >
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Fitness Level Card */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Fitness Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "BMI", value: profile.weight && profile.height ? (profile.weight / (profile.height / 100) ** 2).toFixed(1) : "—", status: "" },
              { label: "Body Fat", value: profile.fat_percentage ? `${profile.fat_percentage}%` : "—", status: "" },
              { label: "Fitness Level", value: "—", status: "" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-foreground/70 text-sm mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-primary mb-2">{item.value}</p>
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
        </>)}
      </div>
    </div>
  )
}
