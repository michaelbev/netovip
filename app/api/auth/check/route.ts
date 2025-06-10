import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { MOCK_USER, MOCK_PROFILE } from "@/lib/mock-auth"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function GET() {
  // Always return authenticated for demo
  if (process.env.DEMO_MODE === "true") {
    return NextResponse.json({
      authenticated: true,
      needsSetup: false,
      user: {
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        profile: {
          full_name: MOCK_PROFILE.full_name,
          role: MOCK_PROFILE.role,
          company_id: MOCK_PROFILE.company_id,
          company: MOCK_PROFILE.companies,
        },
      },
      debug: {
        hasProfile: true,
        hasCompany: true,
        companyName: MOCK_PROFILE.companies.name,
        mode: "DEMO_MODE",
      },
    })
  }

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
          debug: {
            authError: authError?.message,
            hasUser: !!user,
          },
        },
        { status: 401 },
      )
    }

    // Check for profile and company association with detailed logging
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        role,
        company_id,
        companies (
          id,
          name,
          email
        )
      `)
      .eq("id", user.id)
      .single()

    // Log the query for debugging
    console.log("Profile query result:", { profile, profileError, userId: user.id })

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
          debug: {
            reason: "Profile not found",
            profileError: profileError.message,
          },
        })
      }

      return NextResponse.json(
        {
          authenticated: false,
          needsSetup: true,
          error: "Profile lookup failed",
          debug: {
            profileError: profileError.message,
            profileErrorCode: profileError.code,
          },
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
          company: profile?.companies,
        },
      },
      debug: {
        hasProfile: !!profile,
        hasCompany: !!profile?.company_id,
        companyName: profile?.companies?.name,
      },
    })
  } catch (error: any) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        needsSetup: true,
        error: "Internal server error",
        debug: {
          errorMessage: error.message,
          errorStack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
