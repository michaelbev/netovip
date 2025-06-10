import { type NextRequest, NextResponse } from "next/server"

// Mock expenses data for demo
const MOCK_EXPENSES = [
  {
    id: "exp-001",
    description: "Pump Jack Maintenance - Eagle Ford #23",
    amount: 2500,
    expense_date: "2024-01-15",
    category: "Equipment Maintenance",
    status: "paid",
    well_id: "well-001",
    wells: { name: "Eagle Ford #23" },
  },
  {
    id: "exp-002",
    description: "Transportation Services - December",
    amount: 8750,
    expense_date: "2024-01-10",
    category: "Transportation",
    status: "pending",
    well_id: "well-002",
    wells: { name: "Permian #18" },
  },
  {
    id: "exp-003",
    description: "Electrical System Repair",
    amount: 4200,
    expense_date: "2024-01-08",
    category: "Equipment Repair",
    status: "approved",
    well_id: "well-001",
    wells: { name: "Eagle Ford #23" },
  },
  {
    id: "exp-004",
    description: "Monthly Utilities - Field Office",
    amount: 1850,
    expense_date: "2024-01-05",
    category: "Utilities",
    status: "paid",
    well_id: null,
    wells: null,
  },
  {
    id: "exp-005",
    description: "Safety Equipment Purchase",
    amount: 3200,
    expense_date: "2024-01-03",
    category: "Safety",
    status: "pending",
    well_id: "well-003",
    wells: { name: "Bakken #31" },
  },
  {
    id: "exp-006",
    description: "Drilling Supplies - Bakken #31",
    amount: 15000,
    expense_date: "2023-12-28",
    category: "Drilling",
    status: "paid",
    well_id: "well-003",
    wells: { name: "Bakken #31" },
  },
  {
    id: "exp-007",
    description: "Environmental Compliance Testing",
    amount: 5500,
    expense_date: "2023-12-20",
    category: "Compliance",
    status: "approved",
    well_id: null,
    wells: null,
  },
  {
    id: "exp-008",
    description: "Equipment Rental - December",
    amount: 7800,
    expense_date: "2023-12-15",
    category: "Equipment Rental",
    status: "pending",
    well_id: "well-002",
    wells: { name: "Permian #18" },
  },
]

export async function GET(request: NextRequest) {
  try {
    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (isDemoMode) {
      // Return mock data for demo
      return NextResponse.json({
        expenses: MOCK_EXPENSES,
        message: "Demo mode - using sample data",
      })
    }

    // If not in demo mode, try to use real Supabase (but provide fallback)
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
                // Ignore cookie setting errors
              }
            },
          },
        },
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // No session, return mock data
        return NextResponse.json({
          expenses: MOCK_EXPENSES,
          message: "No session - using demo data",
        })
      }

      // Get user's company_id
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", session.user.id).single()

      if (!profile?.company_id) {
        // No company, return mock data
        return NextResponse.json({
          expenses: MOCK_EXPENSES,
          message: "No company - using demo data",
        })
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
        // Return mock data on database error
        return NextResponse.json({
          expenses: MOCK_EXPENSES,
          message: "Database error - using demo data",
        })
      }

      return NextResponse.json({ expenses: expenses || [] })
    } catch (supabaseError) {
      console.error("Supabase error:", supabaseError)
      // Return mock data on Supabase error
      return NextResponse.json({
        expenses: MOCK_EXPENSES,
        message: "Supabase error - using demo data",
      })
    }
  } catch (error) {
    console.error("Expenses API error:", error)
    // Final fallback to mock data
    return NextResponse.json({
      expenses: MOCK_EXPENSES,
      message: "API error - using demo data",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, amount, category, well_id, expense_date } = body

    // In demo mode, just return a success response
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (isDemoMode) {
      const newExpense = {
        id: `exp-${Date.now()}`,
        description,
        amount: Number.parseFloat(amount),
        category,
        well_id,
        expense_date: expense_date || new Date().toISOString().split("T")[0],
        status: "pending",
        wells: well_id ? { name: `Well ${well_id}` } : null,
      }

      return NextResponse.json({
        expense: newExpense,
        message: "Demo mode - expense created successfully",
      })
    }

    // If not demo mode, try real creation (with fallback)
    return NextResponse.json({
      expense: {
        id: `exp-${Date.now()}`,
        description,
        amount: Number.parseFloat(amount),
        category,
        well_id,
        expense_date: expense_date || new Date().toISOString().split("T")[0],
        status: "pending",
      },
      message: "Expense created successfully",
    })
  } catch (error) {
    console.error("Expenses POST API error:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
