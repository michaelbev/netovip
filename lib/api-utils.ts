import { createClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function withTenantIsolation(
  req: NextRequest,
  handler: (req: NextRequest, tenantId: string) => Promise<NextResponse>,
) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get user's company_id
  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company associated with user" }, { status: 400 })
  }

  // Get tenant ID from header or profile
  const tenantId = req.headers.get("x-tenant-id") || profile.company_id

  // Verify tenant ID matches user's company
  if (tenantId !== profile.company_id) {
    return NextResponse.json({ error: "Tenant isolation violation" }, { status: 403 })
  }

  // Call the handler with tenant ID
  return handler(req, tenantId)
}
