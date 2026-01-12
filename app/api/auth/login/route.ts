import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // TODO: Replace with actual database authentication
    // For now, accept any credentials for demo purposes
    const user = {
      id: "1",
      email,
      name: email.split("@")[0],
      createdAt: new Date().toISOString(),
    }

    // TODO: Generate actual JWT token
    const token = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64")

    return NextResponse.json(
      {
        user,
        token,
        message: "Login successful",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
