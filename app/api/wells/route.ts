import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    console.log("=== Wells API Called ===")
    console.log("Request cookies:", cookies().getAll())

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
        console.log("Supabase getUser() result:", result)
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

    // Get wells for the company with enhanced data
    let wells = null,
      wellsError = null
    retries = 3

    while (retries > 0) {
      try {
        const result = await supabase
          .from("wells")
          .select(`
            *,
            daily_production,
            monthly_revenue,
            last_production_date,
            total_depth,
            spud_date,
            completion_date
          `)
          .eq("company_id", profile.company_id)
          .order("name")

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

    // Add mock production and revenue data for demonstration
    const enhancedWells = (wells || []).map((well) => ({
      ...well,
      daily_production: well.daily_production || Math.floor(Math.random() * 100) + 20,
      monthly_revenue: well.monthly_revenue || Math.floor(Math.random() * 50000) + 10000,
      last_production_date: well.last_production_date || new Date().toISOString().split("T")[0],
    }))

    console.log("Wells API - Success:", enhancedWells?.length || 0, "wells found")
    return NextResponse.json({ wells: enhancedWells || [] })
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

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const body = await req.json()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Get user's profile and company
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.company_id) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 403 })
    }

    // Create the well
    const { data: well, error: wellError } = await supabase
      .from("wells")
      .insert({
        ...body,
        company_id: profile.company_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (wellError) {
      console.error("Well creation error:", wellError)
      return NextResponse.json({ error: "Failed to create well", details: wellError.message }, { status: 500 })
    }

    return NextResponse.json({ well })
  } catch (error: any) {
    console.error("Wells POST API - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
