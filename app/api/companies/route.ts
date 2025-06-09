import { createClient } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase-admin"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()

  // Validate required fields
  if (!body.name || !body.email || !body.userId) {
    return NextResponse.json({ error: "Name, email, and user ID are required" }, { status: 400 })
  }

  try {
    // First, verify the user exists and is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user || user.id !== body.userId) {
      return NextResponse.json({ error: "Unauthorized - user mismatch" }, { status: 401 })
    }

    // Check if user already has a company
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", body.userId)
      .single()

    if (existingProfile?.company_id) {
      return NextResponse.json({ error: "User already has a company" }, { status: 400 })
    }

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

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
      throw new Error(`Failed to create company: ${companyError.message}`)
    }

    // Update or create user profile with company_id and admin role
    const { error: profileError } = await adminSupabase.from("profiles").upsert(
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

    if (profileError) {
      console.error("Profile update error:", profileError)
      // Try to clean up the company if profile creation failed
      await adminSupabase.from("companies").delete().eq("id", company.id)
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    return NextResponse.json({ success: true, company }, { status: 201 })
  } catch (error: any) {
    console.error("Company creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's company
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      company_id,
      companies:company_id(*)
    `)
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) {
    return NextResponse.json({ company: null })
  }

  return NextResponse.json({ company: profile.companies })
}
