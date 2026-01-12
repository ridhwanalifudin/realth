import { NextResponse } from "next/server"

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Create a success response
 */
export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    } as ApiResponse<T>,
    { status }
  )
}

/**
 * Create an error response
 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse,
    { status }
  )
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown) {
  console.error("API Error:", error)

  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  return errorResponse("Internal server error", 500)
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): string | null {
  for (const field of requiredFields) {
    if (!data[field]) {
      return `${String(field)} is required`
    }
  }
  return null
}

/**
 * Parse and validate request body
 */
export async function parseRequestBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch (error) {
    throw new Error("Invalid JSON body")
  }
}
