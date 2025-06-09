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

    // Fetch distributions from database
    const { data: distributions, error } = await supabase
      .from("distributions")
      .select(`
        id,
        period_start,
        period_end,
        total_amount,
        status,
        distribution_date,
        created_at
      `)
      .eq("company_id", profile.company_id)
      .order("period_start", { ascending: false })

    if (error) {
      console.error("Error fetching distributions:", error)
      return NextResponse.json({ error: "Failed to fetch distributions" }, { status: 500 })
    }

    // Get owner count for each distribution period
    const distributionsWithOwnerCount = await Promise.all(
      (distributions || []).map(async (dist) => {
        const { count } = await supabase
          .from("distribution_details")
          .select("*", { count: "exact", head: true })
          .eq("distribution_id", dist.id)

        return {
          ...dist,
          owner_count: count || 0,
        }
      }),
    )

    return NextResponse.json({ distributions: distributionsWithOwnerCount })
  } catch (error) {
    console.error("Distributions API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
