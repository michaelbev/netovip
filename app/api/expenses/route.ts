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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
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

    // Fetch expenses from database
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select(`
        id,
        description,
        amount,
        expense_date,
        category,
        status,
        well_id,
        wells(name)
      `)
      .eq("company_id", profile.company_id)
      .order("expense_date", { ascending: false })

    if (error) {
      console.error("Error fetching expenses:", error)
      return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
    }

    return NextResponse.json({ expenses: expenses || [] })
  } catch (error) {
    console.error("Expenses API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { description, amount, category, well_id, expense_date } = body

    // Get user's company_id
    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", session.user.id).single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: "No company associated with user" }, { status: 400 })
    }

    // Create new expense
    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        description,
        amount,
        category,
        well_id,
        expense_date: expense_date || new Date().toISOString().split("T")[0],
        company_id: profile.company_id,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating expense:", error)
      return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error("Expenses POST API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
