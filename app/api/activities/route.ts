import { NextRequest, NextResponse } from "next/server"

// TODO: Replace with actual database queries
let mockActivities = [
  {
    id: "1",
    userId: "1",
    name: "Morning Run",
    date: "2026-01-15",
    distance: 9.0,
    time: "58:30",
    avgPace: "6:26",
    calories: 780,
    heartRate: { avg: 158, max: 175 },
    vo2max: 48.2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "1",
    name: "Evening Jog",
    date: "2026-01-12",
    distance: 6.5,
    time: "40:15",
    avgPace: "6:10",
    calories: 520,
    heartRate: { avg: 145, max: 162 },
    vo2max: 47.8,
    createdAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from authentication token
    const userId = "1"

    // TODO: Fetch from database
    const userActivities = mockActivities.filter((a) => a.userId === userId)

    return NextResponse.json({ activities: userActivities }, { status: 200 })
  } catch (error) {
    console.error("Get activities error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // TODO: Get userId from authentication token
    const userId = "1"

    // Validate required fields
    if (!data.name || !data.distance || !data.time) {
      return NextResponse.json(
        { error: "Name, distance, and time are required" },
        { status: 400 }
      )
    }

    // TODO: Save to database
    const newActivity = {
      id: Date.now().toString(),
      userId,
      ...data,
      createdAt: new Date().toISOString(),
    }

    mockActivities.push(newActivity)

    return NextResponse.json(
      { activity: newActivity, message: "Activity created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create activity error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
