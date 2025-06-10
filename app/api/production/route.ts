import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== Production API Called ===")

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("Production API - User check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userError: userError?.message,
    })

    if (userError || !user) {
      console.error("Production API - No user found:", userError?.message || "No session")
      return NextResponse.json(
        {
          error: "Authentication required",
          details: userError?.message || "No authenticated session found",
          needsAuth: true,
        },
        { status: 401 },
      )
    }

    // Get user's profile and company
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    console.log("Production API - Profile check:", {
      hasProfile: !!profile,
      companyId: profile?.company_id,
      role: profile?.role,
      profileError: profileError?.message,
    })

    if (profileError || !profile?.company_id) {
      return NextResponse.json(
        {
          error: "No company associated with user",
          details: "User needs to be associated with a company",
          needsSetup: true,
        },
        { status: 403 },
      )
    }

    // Get production data for the company's wells
    const { data: production, error: productionError } = await supabase
      .from("production")
      .select(`
        *,
        wells (
          name,
          api_number
        )
      `)
      .eq("wells.company_id", profile.company_id)
      .order("production_date", { ascending: false })

    console.log("Production API - Production query:", {
      companyId: profile.company_id,
      productionCount: production?.length || 0,
      productionError: productionError?.message,
    })

    if (productionError) {
      console.error("Production API - Query error:", productionError)
      return NextResponse.json(
        { error: "Failed to fetch production", details: productionError.message },
        { status: 500 },
      )
    }

    console.log("Production API - Success:", production?.length || 0, "production records found")
    return NextResponse.json({ production: production || [] })
  } catch (error: any) {
    console.error("Production API - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
