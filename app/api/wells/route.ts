import { withTenantIsolation } from "@/lib/api-utils"
import { createClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return withTenantIsolation(request, async (req, tenantId) => {
    const supabase = createClient()

    // Fetch wells for the tenant
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
      .eq("company_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ wells })
  })
}

export async function POST(request: NextRequest) {
  return withTenantIsolation(request, async (req, tenantId) => {
    const supabase = createClient()
    const body = await req.json()

    // Insert new well with tenant ID
    const { data: well, error } = await supabase
      .from("wells")
      .insert({
        ...body,
        company_id: tenantId, // Enforce tenant ID
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ well }, { status: 201 })
  })
}
