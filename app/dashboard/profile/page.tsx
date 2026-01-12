"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Calendar, Weight, Weight as Height, Zap, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UserProfile {
  name: string
  email: string
  age: number
  weight: number
  height: number
  fatPercentage: number
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
    name: "Alex Runner",
    email: "alex@example.com",
    age: 28,
    weight: 72,
    height: 180,
    fatPercentage: 12.5,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setProfile((prev) => ({
        ...prev,
        name: userData.name || prev.name,
        email: userData.email || prev.email,
      }))
    }
  }, [])

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setProfile((prev) => ({
      ...prev,
      [field]: typeof value === "number" ? Number.parseFloat(value as string) : value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    localStorage.setItem("userProfile", JSON.stringify(profile))
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

        {/* Success Message */}
        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-6 font-medium"
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
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{profile.name}</h2>
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
                  { label: "Full Name", value: profile.name, field: "name", icon: User },
                  { label: "Email", value: profile.email, field: "email", icon: Mail },
                  { label: "Age", value: profile.age, field: "age", icon: Calendar },
                  { label: "Height (cm)", value: profile.height, field: "height", icon: Height },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.div key={item.field} variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-medium text-foreground flex items-center gap-2">
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
                  { label: "Body Fat %", value: profile.fatPercentage, field: "fatPercentage", icon: Zap },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <motion.div key={item.field} variants={itemVariants} className="space-y-2">
                      <label className="block text-sm font-medium text-foreground flex items-center gap-2">
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
                  <Save size={18} />
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
          className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Fitness Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "BMI", value: (profile.weight / (profile.height / 100) ** 2).toFixed(1), status: "Normal" },
              { label: "Body Fat", value: `${profile.fatPercentage}%`, status: "Fit" },
              { label: "Fitness Level", value: "Advanced", status: "Excellent" },
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
      </div>
    </div>
  )
}
