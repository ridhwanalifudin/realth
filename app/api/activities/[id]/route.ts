import { NextRequest, NextResponse } from "next/server"

// TODO: Replace with actual database
const mockActivities = [
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
    route: [
      { lat: 40.7128, lng: -74.006, elevation: 10 },
      { lat: 40.7138, lng: -74.007, elevation: 12 },
    ],
    createdAt: new Date().toISOString(),
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Fetch from database with user authentication
    const activity = mockActivities.find((a) => a.id === id)

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ activity }, { status: 200 })
  } catch (error) {
    console.error("Get activity error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // TODO: Delete from database with user authentication
    const index = mockActivities.findIndex((a) => a.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    mockActivities.splice(index, 1)

    return NextResponse.json(
      { message: "Activity deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete activity error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    // TODO: Update in database with user authentication
    const index = mockActivities.findIndex((a) => a.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      )
    }

    mockActivities[index] = { ...mockActivities[index], ...data }

    return NextResponse.json(
      { activity: mockActivities[index], message: "Activity updated successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Update activity error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
