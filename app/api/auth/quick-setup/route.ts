import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, company_id")
      .eq("id", user.id)
      .single()

    if (existingProfile?.company_id) {
      return NextResponse.json({
        success: true,
        message: "User already has company setup",
        profile: existingProfile,
      })
    }

    // Create company first
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: "My Oil & Gas Company",
        email: user.email,
      })
      .select()
      .single()

    if (companyError) {
      console.error("Company creation error:", companyError)
      return NextResponse.json({ error: "Failed to create company", details: companyError }, { status: 500 })
    }

    // Create or update profile
    const profileData = {
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || "User",
      role: "admin" as const,
      company_id: company.id,
    }

    const { data: profile, error: profileError } = await supabase.from("profiles").upsert(profileData).select().single()

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json({ error: "Failed to create profile", details: profileError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "User setup completed successfully",
      profile,
      company,
    })
  } catch (error: any) {
    console.error("Quick setup error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
