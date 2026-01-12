'use client'

import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useActivitiesStore } from '@/store/activities'
import { mockActivities } from '@/lib/mock-data'
import { Search, Activity, Clock, Zap, Eye, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'

const ITEMS_PER_PAGE = 10

export default function ActivitiesPage() {
  const { activities, setActivities } = useActivitiesStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Initialize with mock data if empty
  useEffect(() => {
    if (activities.length === 0) {
      setActivities(mockActivities)
    }
  }, [activities.length, setActivities])

  // Filter and search logic
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [activities, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0)
    const totalDuration = activities.reduce((sum, a) => sum + a.moving_time, 0)
    const avgPace = activities.length > 0 
      ? activities.reduce((sum, a) => sum + (a.moving_time / a.distance), 0) / activities.length 
      : 0
    const totalActivities = activities.length

    return {
      totalDistance: (totalDistance / 1000).toFixed(1),
      totalDuration: Math.floor(totalDuration / 60),
      avgPace: avgPace.toFixed(2),
      totalActivities
    }
  }, [activities])

  // Pagination logic
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Activities</h1>
          <p className="text-foreground/70">Track and manage your running activities</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs font-medium">
                <Activity className="h-4 w-4 text-primary" />
                Total Distance
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.totalDistance} <span className="text-base text-muted-foreground">km</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs font-medium">
                <Clock className="h-4 w-4 text-primary" />
                Total Time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.totalDuration} <span className="text-base text-muted-foreground">min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs font-medium">
                <Zap className="h-4 w-4 text-primary" />
                Avg Pace
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold">
                {stats.avgPace} <span className="text-base text-muted-foreground">min/km</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-xs font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                Total Runs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl sm:text-3xl font-bold">{stats.totalActivities}</div>
            </CardContent>
          </Card>
        </div>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Recent Activities</CardTitle>
              <Button size="sm" asChild>
                <Link href="/dashboard/add-activity">Add Activity</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredActivities.length === 0 ? (
              <div className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground text-lg">No activities found</p>
                <p className="text-muted-foreground/70 text-sm mt-2">Try adjusting your search or add a new activity</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-background border border-border rounded-lg hover:border-primary transition group cursor-pointer"
                    >
                      <Link href={`/dashboard/activities/${activity.id}`} className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition shrink-0">
                          <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground truncate">{activity.display_name}</p>
                            {activity.is_personal_best && (
                              <Badge variant="default" className="text-xs shrink-0">PR</Badge>
                            )}
                            {!activity.is_synced && (
                              <Badge variant="secondary" className="text-xs shrink-0">Not Synced</Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground/70">
                            {new Date(activity.start_date_local).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </Link>

                      <div className="hidden md:flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{(activity.distance / 1000).toFixed(2)} km</p>
                          <p className="text-xs text-foreground/70">
                            {Math.floor(activity.moving_time / 60)}:{(activity.moving_time % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{activity.avg_heart_rate || 'N/A'} bpm</p>
                          <p className="text-xs text-foreground/70">Avg HR</p>
                        </div>
                        <Link href={`/dashboard/activities/${activity.id}`}>
                          <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                            <Eye size={20} />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length} activities
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
