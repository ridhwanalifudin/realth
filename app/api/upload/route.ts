import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = [".gpx", ".fit", ".tcx"]
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."))
    
    if (!validTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file type. Only GPX, FIT, and TCX files are supported" },
        { status: 400 }
      )
    }

    // TODO: Parse GPX/FIT file and extract activity data
    // TODO: Save to database
    // For now, just return success with mock data
    const mockActivity = {
      id: Date.now().toString(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      distance: 8.5,
      time: "45:30",
      avgPace: "5:20",
      calories: 650,
      heartRate: { avg: 155, max: 172 },
      uploadedAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        activity: mockActivity,
        message: "File uploaded successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
