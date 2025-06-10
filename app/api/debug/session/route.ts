import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("=== Debug Session API Called ===")

    const supabase = await createClient()

    // Get session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("Debug Session - Results:", {
      hasSession: !!session,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      sessionError: sessionError?.message,
      userError: userError?.message,
    })

    // Get profile if user exists
    let profile = null
    let profileError = null

    if (user) {
      const profileResult = await supabase.from("profiles").select("*").eq("id", user.id).single()
      profile = profileResult.data
      profileError = profileResult.error
    }

    return NextResponse.json({
      session: {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError?.message,
      },
      user: {
        exists: !!user,
        id: user?.id,
        email: user?.email,
        error: userError?.message,
      },
      profile: {
        exists: !!profile,
        companyId: profile?.company_id,
        role: profile?.role,
        error: profileError?.message,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Debug Session - Error:", error)
    return NextResponse.json(
      {
        error: "Debug session failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
