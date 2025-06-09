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

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company associated with user" }, { status: 400 })
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
