"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Activity, TrendingUp, Heart, MapPin, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data
const activityData = [
  { date: "Jan 1", distance: 5.2, time: 31 },
  { date: "Jan 3", distance: 6.8, time: 42 },
  { date: "Jan 5", distance: 5.5, time: 35 },
  { date: "Jan 7", distance: 7.2, time: 48 },
  { date: "Jan 10", distance: 8.1, time: 52 },
  { date: "Jan 12", distance: 6.5, time: 40 },
  { date: "Jan 15", distance: 9.0, time: 58 },
]

const activities = [
  {
    id: 1,
    name: "Morning Run",
    date: "Jan 15, 2026",
    distance: 9.0,
    time: "58:30",
    avgPace: "6:26",
    calories: 780,
    heartRate: { avg: 158, max: 175 },
    vo2max: 48.2,
  },
  {
    id: 2,
    name: "Evening Jog",
    date: "Jan 12, 2026",
    distance: 6.5,
    time: "40:15",
    avgPace: "6:10",
    calories: 520,
    heartRate: { avg: 145, max: 162 },
    vo2max: 47.8,
  },
  {
    id: 3,
    name: "Tempo Run",
    date: "Jan 10, 2026",
    distance: 8.1,
    time: "52:45",
    avgPace: "6:32",
    calories: 680,
    heartRate: { avg: 165, max: 178 },
    vo2max: 49.1,
  },
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

export default function DashboardPage() {
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-foreground/70">Track your fitness progress and performance</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Distance", value: "42.1 km", icon: MapPin, color: "from-primary to-primary/50" },
            { label: "Avg Heart Rate", value: "156 bpm", icon: Heart, color: "from-red-500 to-red-400" },
            { label: "VO2max", value: "48.7", icon: TrendingUp, color: "from-green-500 to-green-400" },
            { label: "Total Time", value: "4h 47m", icon: Clock, color: "from-blue-500 to-blue-400" },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div key={i} variants={itemVariants}>
                <Card className="hover:border-primary transition group">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-lg bg-linear-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-foreground/70 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Distance Chart */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Distance Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="rgb(61, 93, 245)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="rgb(61, 93, 245)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(0,0,0,0.1)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgb(0,0,0,0.5)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="rgb(0,0,0,0.5)" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgb(20, 20, 25)",
                        border: "1px solid rgb(100, 100, 100)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "white" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="distance"
                      stroke="rgb(61, 93, 245)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorDistance)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* VO2max Card */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible">
            <Card className="flex flex-col justify-between h-full">
              <CardHeader>
                <CardTitle>VO2max Progress</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">48.7</div>
                  <p className="text-foreground/70 text-sm mb-6">Excellent fitness level</p>
                </div>
                <div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-linear-to-r from-primary to-secondary"></div>
                  </div>
                  <p className="text-xs text-foreground/50 mt-2">↑ 2.3% from last month</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Activities List */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activities</CardTitle>
                <Link href="/dashboard/activities" className="text-primary text-sm font-semibold hover:underline">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition">
                        <Activity className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{activity.name}</p>
                        <p className="text-sm text-foreground/70">{activity.date}</p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{activity.distance} km</p>
                        <p className="text-xs text-foreground/70">{activity.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{activity.heartRate.avg} bpm</p>
                        <p className="text-xs text-foreground/70">Avg HR</p>
                      </div>
                      <Link href={`/dashboard/activities/${activity.id}`}>
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                          <Eye size={20} />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
