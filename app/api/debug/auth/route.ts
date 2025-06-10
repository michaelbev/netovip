import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get user and session info
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      auth: {
        user: user
          ? {
              id: user.id,
              email: user.email,
              hasUser: true,
            }
          : null,
        session: session
          ? {
              hasSession: true,
              hasAccessToken: !!session.access_token,
              expiresAt: session.expires_at,
            }
          : null,
        errors: {
          userError: userError?.message,
          sessionError: sessionError?.message,
        },
      },
    })
  } catch (error) {
    console.error("Debug Auth API Error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV !== "production" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
