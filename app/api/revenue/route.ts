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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Profile error:", profileError)

    // If profile doesn't exist, create a basic one
    if (profileError.code === "PGRST116") {
      const { error: createError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        role: "operator",
      })

      if (createError) {
        console.error("Failed to create profile:", createError)
      }

      return NextResponse.json({ revenue: [] })
    }

    return NextResponse.json({ error: "Profile lookup failed" }, { status: 500 })
  }

  if (!profile?.company_id) {
    return NextResponse.json({ revenue: [] })
  }

  const { data: revenue, error } = await supabase
    .from("revenue")
    .select(`
      *,
      wells:well_id(name, api_number),
      owners:owner_id(name)
    `)
    .eq("company_id", profile.company_id)
    .order("production_month", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ revenue })
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

  if (!["admin", "accountant"].includes(profile.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  const body = await request.json()

  const { data: revenue, error } = await supabase
    .from("revenue")
    .insert({
      ...body,
      company_id: profile.company_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ revenue }, { status: 201 })
}
