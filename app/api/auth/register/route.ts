import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // TODO: Replace with actual database user creation
    // Check if user already exists, hash password, etc.
    const user = {
      id: Date.now().toString(),
      email,
      name: name || email.split("@")[0],
      createdAt: new Date().toISOString(),
    }

    // TODO: Generate actual JWT token
    const token = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64")

    return NextResponse.json(
      {
        user,
        token,
        message: "Registration successful",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
