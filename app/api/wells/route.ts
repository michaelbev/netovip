import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("=== Wells API Called ===")

    const supabase = await createClient()

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Get the current user with retry logic
    let user, userError
    let retries = 3

    while (retries > 0) {
      try {
        const result = await supabase.auth.getUser()
        user = result.data.user
        userError = result.error
        break
      } catch (error: any) {
        console.log(`Auth attempt failed, retries left: ${retries - 1}`, error.message)
        retries--
        if (retries === 0) {
          userError = error
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    console.log("Wells API - User check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userError: userError?.message,
    })

    if (userError || !user) {
      console.error("Wells API - No user found:", userError?.message)
      return NextResponse.json(
        {
          error: "Authentication failed",
          details: userError?.message || "No user found",
          retry: true,
        },
        { status: 401 },
      )
    }

    // Get user's profile and company with retry logic
    let profile, profileError
    retries = 3

    while (retries > 0) {
      try {
        const result = await supabase.from("profiles").select("company_id, role").eq("id", user.id).single()

        profile = result.data
        profileError = result.error
        break
      } catch (error: any) {
        console.log(`Profile query failed, retries left: ${retries - 1}`, error.message)
        retries--
        if (retries === 0) {
          profileError = error
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    console.log("Wells API - Profile check:", {
      hasProfile: !!profile,
      companyId: profile?.company_id,
      role: profile?.role,
      profileError: profileError?.message,
    })

    if (profileError) {
      console.error("Wells API - Profile error:", profileError)

      if (profileError.code === "PGRST116") {
        return NextResponse.json(
          {
            error: "Profile not found",
            details: "User profile needs to be created. Please run the setup scripts.",
            needsSetup: true,
          },
          { status: 403 },
        )
      }

      return NextResponse.json(
        {
          error: "Profile lookup failed",
          details: profileError.message,
          retry: true,
        },
        { status: 500 },
      )
    }

    if (!profile?.company_id) {
      console.log("Wells API - No company associated")
      return NextResponse.json(
        {
          error: "No company associated with user",
          details: "User needs to be associated with a company. Please run script 19-fix-current-user-company.sql",
          needsSetup: true,
        },
        { status: 403 },
      )
    }

    // Get wells for the company with retry logic
    let wells, wellsError
    retries = 3

    while (retries > 0) {
      try {
        const result = await supabase.from("wells").select("*").eq("company_id", profile.company_id).order("name")

        wells = result.data
        wellsError = result.error
        break
      } catch (error: any) {
        console.log(`Wells query failed, retries left: ${retries - 1}`, error.message)
        retries--
        if (retries === 0) {
          wellsError = error
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    console.log("Wells API - Wells query:", {
      companyId: profile.company_id,
      wellsCount: wells?.length || 0,
      wellsError: wellsError?.message,
    })

    if (wellsError) {
      console.error("Wells API - Query error:", wellsError)
      return NextResponse.json(
        {
          error: "Failed to fetch wells",
          details: wellsError.message,
          retry: true,
        },
        { status: 500 },
      )
    }

    console.log("Wells API - Success:", wells?.length || 0, "wells found")
    return NextResponse.json({ wells: wells || [] })
  } catch (error: any) {
    console.error("Wells API - Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        retry: true,
      },
      { status: 500 },
    )
  }
}
