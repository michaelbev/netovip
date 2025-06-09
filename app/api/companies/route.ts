import { createClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const body = await request.json()

  // Validate required fields
  if (!body.name || !body.email || !body.userId) {
    return NextResponse.json({ error: "Name, email, and user ID are required" }, { status: 400 })
  }

  try {
    // Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: body.name,
        email: body.email,
      })
      .select()
      .single()

    if (companyError) throw companyError

    // Update user profile with company_id and admin role
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        company_id: company.id,
        role: "admin",
        full_name: body.userName,
      })
      .eq("id", body.userId)

    if (profileError) throw profileError

    // Create default tenant settings
    const { error: settingsError } = await supabase.from("tenant_settings").insert({
      company_id: company.id,
    })

    if (settingsError) {
      console.warn("Failed to create tenant settings:", settingsError)
      // Don't fail the whole process for this
    }

    // Initialize tenant usage tracking
    const currentDate = new Date()
    const { error: usageError } = await supabase.from("tenant_usage").insert({
      company_id: company.id,
      month: currentDate.toISOString().substring(0, 7) + "-01", // First day of current month
      user_count: 1,
    })

    if (usageError) {
      console.warn("Failed to create usage tracking:", usageError)
      // Don't fail the whole process for this
    }

    return NextResponse.json({ success: true, company }, { status: 201 })
  } catch (error: any) {
    console.error("Company creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
