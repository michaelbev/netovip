import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's profile with company information
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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's profile to check company_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 })
    }

    // Only admins can update company info
    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Only admins can update company information" }, { status: 403 })
    }

    // Update company information
    const { data: company, error: updateError } = await supabase
      .from("companies")
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        website: body.website,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        country: body.country,
        tax_id: body.tax_id,
        industry: body.industry,
        description: body.description,
        operator_id: body.operator_id,
        rrc_number: body.rrc_number,
        federal_id: body.federal_id,
        insurance_provider: body.insurance_provider,
        emergency_contact: body.emergency_contact,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.company_id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: `Failed to update company: ${updateError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, company })
  } catch (error: any) {
    console.error("Company update error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
