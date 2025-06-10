import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("=== Debug Users API Starting ===")

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Environment check:")
    console.log("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✓ Set" : "✗ Missing")
    console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", anonKey ? "✓ Set" : "✗ Missing")

    if (!supabaseUrl) {
      return NextResponse.json({
        error: "Missing NEXT_PUBLIC_SUPABASE_URL environment variable",
        users: [],
        total: 0,
        debug: {
          supabaseUrl: "Missing",
          serviceRoleKey: serviceRoleKey ? "Present" : "Missing",
          anonKey: anonKey ? "Present" : "Missing",
        },
      })
    }

    if (!serviceRoleKey) {
      return NextResponse.json({
        error: "Missing SUPABASE_SERVICE_ROLE_KEY environment variable",
        users: [],
        total: 0,
        debug: {
          supabaseUrl: "Present",
          serviceRoleKey: "Missing",
          anonKey: anonKey ? "Present" : "Missing",
        },
      })
    }

    // Try to create Supabase client manually
    console.log("Creating Supabase client manually...")

    const { createClient } = await import("@supabase/supabase-js")

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("Supabase client created successfully")

    // Try to list users
    console.log("Attempting to list users...")

    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("Supabase auth.admin.listUsers error:", error)
      return NextResponse.json({
        error: `Supabase error: ${error.message}`,
        users: [],
        total: 0,
        debug: {
          supabaseUrl: "Present",
          serviceRoleKey: "Present",
          anonKey: anonKey ? "Present" : "Missing",
          supabaseError: error.message,
        },
      })
    }

    if (!users || !users.users) {
      console.log("No users returned from Supabase")
      return NextResponse.json({
        users: [],
        total: 0,
        message: "No users found in the system",
        debug: {
          supabaseUrl: "Present",
          serviceRoleKey: "Present",
          anonKey: anonKey ? "Present" : "Missing",
          usersData: "Empty",
        },
      })
    }

    console.log(`Found ${users.users.length} users`)

    // Format users for display
    const formattedUsers = users.users.map((user) => ({
      id: user.id,
      email: user.email || "No email",
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      user_metadata: user.user_metadata || {},
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: users.users.length,
      success: true,
      debug: {
        supabaseUrl: "Present",
        serviceRoleKey: "Present",
        anonKey: anonKey ? "Present" : "Missing",
        usersFound: users.users.length,
      },
    })
  } catch (error: any) {
    console.error("=== Unexpected error in debug users API ===")
    console.error("Error:", error)
    console.error("Stack:", error.stack)

    return NextResponse.json({
      error: `Unexpected error: ${error.message}`,
      users: [],
      total: 0,
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : "Hidden in production",
      },
    })
  }
}
