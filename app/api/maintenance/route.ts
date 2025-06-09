import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Ignore
            }
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's company_id
    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", session.user.id).single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 })
    }

    // Fetch maintenance records from database
    const { data: maintenance, error } = await supabase
      .from("maintenance_records")
      .select(`
        id,
        maintenance_type,
        priority,
        status,
        scheduled_date,
        completed_date,
        description,
        cost,
        well_id,
        wells(name)
      `)
      .eq("company_id", profile.company_id)
      .order("scheduled_date", { ascending: false })

    if (error) {
      console.error("Error fetching maintenance:", error)
      return NextResponse.json({ error: "Failed to fetch maintenance records" }, { status: 500 })
    }

    return NextResponse.json({ maintenance: maintenance || [] })
  } catch (error) {
    console.error("Maintenance API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
