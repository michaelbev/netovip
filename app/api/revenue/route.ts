import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== Revenue API Called ===")

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("Revenue API - User check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userError: userError?.message,
    })

    if (userError || !user) {
      console.error("Revenue API - No user found:", userError?.message)
      return NextResponse.json({ error: "No session found", details: userError?.message }, { status: 401 })
    }

    // Get user's profile and company
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    console.log("Revenue API - Profile check:", {
      hasProfile: !!profile,
      companyId: profile?.company_id,
      role: profile?.role,
      profileError: profileError?.message,
    })

    if (profileError || !profile?.company_id) {
      return NextResponse.json(
        {
          error: "No company associated with user",
          details: "User needs to be associated with a company. Please run script 19-fix-current-user-company.sql",
          needsSetup: true,
        },
        { status: 403 },
      )
    }

    // Get revenue for the company
    const { data: revenue, error: revenueError } = await supabase
      .from("revenue")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("production_month", { ascending: false })

    console.log("Revenue API - Revenue query:", {
      companyId: profile.company_id,
      revenueCount: revenue?.length || 0,
      revenueError: revenueError?.message,
    })

    if (revenueError) {
      console.error("Revenue API - Query error:", revenueError)
      return NextResponse.json({ error: "Failed to fetch revenue", details: revenueError.message }, { status: 500 })
    }

    console.log("Revenue API - Success:", revenue?.length || 0, "revenue records found")
    return NextResponse.json({ revenue: revenue || [] })
  } catch (error: any) {
    console.error("Revenue API - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
