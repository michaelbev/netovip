import { type NextRequest, NextResponse } from "next/server"

// Mock distributions data for demo
const MOCK_DISTRIBUTIONS = [
  {
    id: "dist-1",
    period_start: "2023-05-01",
    period_end: "2023-05-31",
    total_amount: 280000,
    status: "completed",
    distribution_date: "2023-06-05",
    owner_count: 42,
    created_at: "2023-06-01T10:00:00Z",
  },
  {
    id: "dist-2",
    period_start: "2023-04-01",
    period_end: "2023-04-30",
    total_amount: 265000,
    status: "completed",
    distribution_date: "2023-05-05",
    owner_count: 40,
    created_at: "2023-05-01T10:00:00Z",
  },
  {
    id: "dist-3",
    period_start: "2023-03-01",
    period_end: "2023-03-31",
    total_amount: 245000,
    status: "completed",
    distribution_date: "2023-04-05",
    owner_count: 38,
    created_at: "2023-04-01T10:00:00Z",
  },
  {
    id: "dist-4",
    period_start: "2023-02-01",
    period_end: "2023-02-28",
    total_amount: 230000,
    status: "completed",
    distribution_date: "2023-03-05",
    owner_count: 36,
    created_at: "2023-03-01T10:00:00Z",
  },
  {
    id: "dist-5",
    period_start: "2023-01-01",
    period_end: "2023-01-31",
    total_amount: 210000,
    status: "completed",
    distribution_date: "2023-02-05",
    owner_count: 35,
    created_at: "2023-02-01T10:00:00Z",
  },
  {
    id: "dist-6",
    period_start: "2022-12-01",
    period_end: "2022-12-31",
    total_amount: 220000,
    status: "completed",
    distribution_date: "2023-01-05",
    owner_count: 36,
    created_at: "2023-01-01T10:00:00Z",
  },
  {
    id: "dist-7",
    period_start: "2023-06-01",
    period_end: "2023-06-30",
    total_amount: 320000,
    status: "pending",
    distribution_date: null,
    owner_count: 42,
    created_at: "2023-07-01T10:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (isDemoMode) {
      console.log("🎭 Demo Mode: Serving mock distributions data")
      return NextResponse.json({
        distributions: MOCK_DISTRIBUTIONS,
        demo: true,
        message: "Demo data - not connected to live database",
      })
    }

    // Try to use real Supabase in production
    try {
      const { createServerClient } = await import("@supabase/ssr")
      const { cookies } = await import("next/headers")

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
                // Ignore cookie errors
              }
            },
          },
        },
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.log("⚠️ No session found, falling back to demo data")
        return NextResponse.json({
          distributions: MOCK_DISTRIBUTIONS,
          demo: true,
          message: "No authentication session - showing demo data",
        })
      }

      // Get user's company_id
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", session.user.id).single()

      if (!profile?.company_id) {
        console.log("⚠️ No company associated with user, falling back to demo data")
        return NextResponse.json({
          distributions: MOCK_DISTRIBUTIONS,
          demo: true,
          message: "No company association - showing demo data",
        })
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
        console.error("Database error, falling back to demo data:", error)
        return NextResponse.json({
          distributions: MOCK_DISTRIBUTIONS,
          demo: true,
          message: "Database error - showing demo data",
        })
      }

      // Get owner count for each distribution period
      const distributionsWithOwnerCount = await Promise.all(
        (distributions || []).map(async (dist) => {
          try {
            const { count } = await supabase
              .from("distribution_details")
              .select("*", { count: "exact", head: true })
              .eq("distribution_id", dist.id)

            return {
              ...dist,
              owner_count: count || 0,
            }
          } catch {
            return {
              ...dist,
              owner_count: 0,
            }
          }
        }),
      )

      return NextResponse.json({
        distributions: distributionsWithOwnerCount,
        demo: false,
      })
    } catch (supabaseError) {
      console.error("Supabase connection error, falling back to demo data:", supabaseError)
      return NextResponse.json({
        distributions: MOCK_DISTRIBUTIONS,
        demo: true,
        message: "Database connection error - showing demo data",
      })
    }
  } catch (error) {
    console.error("Distributions API error, serving demo data:", error)
    // Final fallback - always return demo data if everything fails
    return NextResponse.json({
      distributions: MOCK_DISTRIBUTIONS,
      demo: true,
      message: "API error - showing demo data",
    })
  }
}
