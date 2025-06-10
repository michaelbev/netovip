import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          needsSetup: true,
          error: "Not authenticated",
        },
        { status: 401 },
      )
    }

    // Check for profile and company association
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id, role, full_name")
      .eq("id", user.id)
      .single()

    if (profileError) {
      // If profile doesn't exist, user needs setup
      if (profileError.code === "PGRST116") {
        return NextResponse.json({
          authenticated: true,
          needsSetup: true,
          user: {
            id: user.id,
            email: user.email,
          },
        })
      }

      return NextResponse.json(
        {
          authenticated: false,
          needsSetup: true,
          error: "Profile lookup failed",
        },
        { status: 500 },
      )
    }

    // Check if user has company association
    const needsSetup = !profile?.company_id

    return NextResponse.json({
      authenticated: true,
      needsSetup,
      user: {
        id: user.id,
        email: user.email,
        profile: {
          full_name: profile?.full_name,
          role: profile?.role,
          company_id: profile?.company_id,
        },
      },
    })
  } catch (error: any) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        needsSetup: true,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
