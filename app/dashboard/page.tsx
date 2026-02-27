"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Activity, TrendingUp, Heart, MapPin, Clock, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { StravaConnect } from "@/components/strava-connect"
import { useActivitiesStore } from "@/store/activities"
import { computeVO2Max, fitnessLabel, vo2Progress } from "@/lib/fitness"

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
  const { activities, fetchActivities } = useActivitiesStore()

  useEffect(() => {
    fetchActivities()
  }, [])

  // Calculate real stats from activities
  const stats = useMemo(() => {
    if (activities.length === 0) return { distance: '0.0', avgHR: 'N/A', vo2max: 'N/A', totalTime: '0h 0m', bestVO2: null as number | null, fitnessLevel: '', progress: 0 }
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0) / 1000
    const activitiesWithHR = activities.filter(a => a.avg_heart_rate)
    const avgHR = activitiesWithHR.length > 0
      ? Math.round(activitiesWithHR.reduce((sum, a) => sum + (a.avg_heart_rate || 0), 0) / activitiesWithHR.length)
      : null
    // VO2Max: prefer stored estimate, fallback to compute from HR
    const vo2Values = activities.map(a => {
      if (a.vo2max_estimate) return a.vo2max_estimate
      if (a.avg_heart_rate) return computeVO2Max(a.avg_heart_rate, a.max_heart_rate ?? null)
      return null
    }).filter(Boolean) as number[]
    const avgVO2 = vo2Values.length > 0
      ? parseFloat((vo2Values.reduce((s, v) => s + v, 0) / vo2Values.length).toFixed(1))
      : null
    const bestVO2 = vo2Values.length > 0 ? Math.max(...vo2Values) : null
    const totalSeconds = activities.reduce((sum, a) => sum + (a.moving_time || 0), 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return {
      distance: totalDistance.toFixed(1),
      avgHR: avgHR ? `${avgHR} bpm` : 'N/A',
      vo2max: avgVO2 ? avgVO2.toFixed(1) : 'N/A',
      totalTime: `${hours}h ${minutes}m`,
      bestVO2,
      fitnessLevel: avgVO2 ? fitnessLabel(avgVO2) : '',
      progress: avgVO2 ? vo2Progress(avgVO2) : 0,
    }
  }, [activities])

  // Chart data from real activities (last 7)
  const chartData = useMemo(() => {
    return [...activities]
      .slice(0, 7)
      .reverse()
      .map(a => ({
        date: new Date(a.start_date_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        distance: parseFloat((a.distance / 1000).toFixed(1)),
      }))
  }, [activities])

  // VO2Max trend (last 10 activities with HR data)
  const vo2TrendData = useMemo(() => {
    return [...activities]
      .filter(a => a.vo2max_estimate || a.avg_heart_rate)
      .slice(0, 10)
      .reverse()
      .map(a => ({
        date: new Date(a.start_date_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        vo2: a.vo2max_estimate ?? (a.avg_heart_rate ? computeVO2Max(a.avg_heart_rate, a.max_heart_rate ?? null) : null),
      }))
      .filter(d => d.vo2 !== null)
  }, [activities])

  const recentActivities = activities.slice(0, 5)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-foreground/70">Track your fitness progress and performance</p>
        </motion.div>

        {/* Strava Connection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <StravaConnect />
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Distance", value: `${stats.distance} km`, icon: MapPin, color: "from-primary to-primary/50" },
            { label: "Avg Heart Rate", value: stats.avgHR, icon: Heart, color: "from-red-500 to-red-400" },
            { label: "VO2max", value: stats.vo2max, icon: TrendingUp, color: "from-green-500 to-green-400" },
            { label: "Total Time", value: stats.totalTime, icon: Clock, color: "from-blue-500 to-blue-400" },
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
                  <AreaChart data={chartData}>
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
                <CardDescription>{activities.length} activities synced</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-4">
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-xs text-foreground/60 mb-1">Average</p>
                    <p className="text-4xl font-bold text-primary">{stats.vo2max}</p>
                    {stats.fitnessLevel && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-primary/15 text-primary rounded-full text-xs font-semibold">
                        {stats.fitnessLevel}
                      </span>
                    )}
                  </div>
                  {stats.bestVO2 && (
                    <div className="ml-auto text-right">
                      <p className="text-xs text-foreground/60 mb-1">Best</p>
                      <p className="text-2xl font-bold text-green-500">{stats.bestVO2.toFixed(1)}</p>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-foreground/50 mb-1">
                    <span>25</span><span>45</span><span>65+</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-green-500 rounded-full transition-all duration-700"
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-foreground/50 mt-1">Scale: Below Avg → Exceptional</p>
                </div>

                {/* Trend sparkline */}
                {vo2TrendData.length > 1 && (
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={vo2TrendData}>
                      <Line type="monotone" dataKey="vo2" stroke="rgb(61,93,245)" strokeWidth={2} dot={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgb(20,20,25)', border: '1px solid rgb(100,100,100)', borderRadius: '6px', fontSize: '11px' }}
                        labelStyle={{ color: 'white' }}
                        formatter={(v: any) => [v, 'VO2max']}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
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
                {recentActivities.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No activities yet. Connect Strava and click "Sync Now"!</p>
                  </div>
                ) : (
                  recentActivities.map((activity) => (
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
                          <p className="font-semibold text-foreground">{activity.display_name}</p>
                          <p className="text-sm text-foreground/70">
                            {new Date(activity.start_date_local).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{(activity.distance / 1000).toFixed(2)} km</p>
                          <p className="text-xs text-foreground/70">
                            {Math.floor(activity.moving_time / 60)}:{(activity.moving_time % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{activity.avg_heart_rate ? `${activity.avg_heart_rate} bpm` : '—'}</p>
                          <p className="text-xs text-foreground/70">Avg HR</p>
                        </div>
                        <Link href={`/dashboard/activities/${activity.id}`}>
                          <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                            <Eye size={20} />
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
