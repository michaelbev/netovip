import { createClient } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase-admin"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.userId) {
      return NextResponse.json({ error: "Name, email, and user ID are required" }, { status: 400 })
    }

    console.log("Creating company for user:", body.userId)

    // Create server client
    const supabase = await createClient()

    if (!supabase || !supabase.auth) {
      console.error("Failed to create Supabase client")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Verify the user exists and is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Auth check result:", { user: user?.email, error: authError })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user || user.id !== body.userId) {
      console.error("User mismatch:", { requestUserId: body.userId, authUserId: user?.id })
      return NextResponse.json({ error: "Unauthorized - user mismatch" }, { status: 401 })
    }

    // Check if user already has a company
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", body.userId)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile check error:", profileError)
      return NextResponse.json({ error: "Failed to check existing profile" }, { status: 500 })
    }

    if (existingProfile?.company_id) {
      return NextResponse.json({ error: "User already has a company" }, { status: 400 })
    }

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    if (!adminSupabase) {
      console.error("Failed to create admin client")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Create company using admin client
    const { data: company, error: companyError } = await adminSupabase
      .from("companies")
      .insert({
        name: body.name,
        email: body.email,
      })
      .select()
      .single()

    if (companyError) {
      console.error("Company creation error:", companyError)
      return NextResponse.json({ error: `Failed to create company: ${companyError.message}` }, { status: 500 })
    }

    console.log("Company created:", company)

    // Update or create user profile with company_id and admin role
    const { error: profileUpdateError } = await adminSupabase.from("profiles").upsert(
      {
        id: body.userId,
        email: body.email,
        full_name: body.userName,
        role: "admin",
        company_id: company.id,
      },
      {
        onConflict: "id",
      },
    )

    if (profileUpdateError) {
      console.error("Profile update error:", profileUpdateError)
      // Try to clean up the company if profile creation failed
      await adminSupabase.from("companies").delete().eq("id", company.id)
      return NextResponse.json({ error: `Failed to update profile: ${profileUpdateError.message}` }, { status: 500 })
    }

    console.log("Profile updated successfully")

    return NextResponse.json({ success: true, company }, { status: 201 })
  } catch (error: any) {
    console.error("Company creation error:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: error.stack,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    if (!supabase || !supabase.auth) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's company
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        company_id,
        companies:company_id(*)
      `)
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    if (!profile?.company_id) {
      return NextResponse.json({ company: null })
    }

    return NextResponse.json({ company: profile.companies })
  } catch (error: any) {
    console.error("Company fetch error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
