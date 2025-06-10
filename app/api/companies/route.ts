import { createAdminClient } from "@/lib/supabase-admin"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.userId) {
      return NextResponse.json({ error: "Name, email, and user ID are required" }, { status: 400 })
    }

    console.log("Creating company for user:", body.userId)

    // Use admin client to bypass RLS during signup
    const adminSupabase = createAdminClient()

    if (!adminSupabase) {
      console.error("Failed to create admin client")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Check if user already has a company
    const { data: existingProfile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("company_id")
      .eq("id", body.userId)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile check error:", profileError)
    }

    if (existingProfile?.company_id) {
      return NextResponse.json({ error: "User already has a company" }, { status: 400 })
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

    // Create or update user profile with company_id and admin role
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
    // For GET requests, we still need authentication
    const adminSupabase = createAdminClient()

    if (!adminSupabase) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // This endpoint would typically require authentication
    // For now, return a generic response
    return NextResponse.json({ message: "Companies endpoint" })
  } catch (error: any) {
    console.error("Company fetch error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
