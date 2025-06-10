import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    console.log("=== Revenue API Called ===")
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))

    const supabase = await createClient()

    // Get the current user with detailed logging
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("Revenue API - Auth check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userError: userError?.message,
      userErrorCode: userError?.status,
    })

    if (userError) {
      console.error("Revenue API - User error details:", {
        message: userError.message,
        status: userError.status,
        name: userError.name,
      })
      return NextResponse.json(
        {
          error: "Authentication error",
          details: userError.message,
          code: userError.status,
          needsAuth: true,
        },
        { status: 401 },
      )
    }

    if (!user) {
      console.error("Revenue API - No user found")

      // Try to get session info for debugging
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log("Revenue API - Session check:", {
        hasSession: !!session,
        sessionError: sessionError?.message,
      })

      return NextResponse.json(
        {
          error: "No authenticated user",
          details: "User session not found. Please log in again.",
          needsAuth: true,
          debug: {
            hasSession: !!session,
            sessionError: sessionError?.message,
          },
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

    console.log("Revenue API - Profile check:", {
      hasProfile: !!profile,
      companyId: profile?.company_id,
      role: profile?.role,
      profileError: profileError?.message,
    })

    if (profileError) {
      console.error("Revenue API - Profile error:", profileError)
      return NextResponse.json(
        {
          error: "Profile not found",
          details: profileError.message,
          needsSetup: true,
        },
        { status: 403 },
      )
    }

    if (!profile?.company_id) {
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
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
