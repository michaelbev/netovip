import { createClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user profile with company_id
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Profile error:", profileError)

    // If profile doesn't exist, create a basic one
    if (profileError.code === "PGRST116") {
      // No rows returned
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          role: "operator",
        })
        .select()
        .single()

      if (createError) {
        console.error("Failed to create profile:", createError)
        return NextResponse.json(
          {
            error: "Profile creation failed",
            details: createError.message,
          },
          { status: 500 },
        )
      }

      // Return empty wells for new user without company
      return NextResponse.json({
        wells: [],
        message: "Profile created. Please set up your company.",
      })
    }

    return NextResponse.json(
      {
        error: "Profile lookup failed",
        details: profileError.message,
      },
      { status: 500 },
    )
  }

  if (!profile?.company_id) {
    return NextResponse.json({
      wells: [],
      message: "No company associated with user. Please complete setup.",
    })
  }

  // Fetch wells for the company
  const { data: wells, error } = await supabase
    .from("wells")
    .select(`
      *,
      production:production(
        production_date,
        oil_volume,
        gas_volume,
        water_volume
      )
    `)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ wells })
}

export async function POST(request: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("company_id, role").eq("id", user.id).single()

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company associated with user" }, { status: 400 })
  }

  if (!["admin", "operator", "accountant"].includes(profile.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  const body = await request.json()

  // Insert new well with company ID
  const { data: well, error } = await supabase
    .from("wells")
    .insert({
      ...body,
      company_id: profile.company_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ well }, { status: 201 })
}
