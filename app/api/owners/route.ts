import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== Owners API Called ===")

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    console.log("Owners API - User check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userError: userError?.message,
    })

    if (userError || !user) {
      console.error("Owners API - No user found:", userError?.message || "No session")
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

    console.log("Owners API - Profile check:", {
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

    // Get owners for the company
    const { data: owners, error: ownersError } = await supabase
      .from("owners")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("name", { ascending: true })

    console.log("Owners API - Owners query:", {
      companyId: profile.company_id,
      ownersCount: owners?.length || 0,
      ownersError: ownersError?.message,
    })

    if (ownersError) {
      console.error("Owners API - Query error:", ownersError)
      return NextResponse.json({ error: "Failed to fetch owners", details: ownersError.message }, { status: 500 })
    }

    console.log("Owners API - Success:", owners?.length || 0, "owners found")
    return NextResponse.json({ owners: owners || [] })
  } catch (error: any) {
    console.error("Owners API - Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
