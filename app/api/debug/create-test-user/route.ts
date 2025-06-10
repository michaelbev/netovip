import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    console.log("=== Create Test User API Starting ===")

    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({
        error: "Email and password are required",
      })
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        error: "Missing Supabase environment variables",
        debug: {
          supabaseUrl: supabaseUrl ? "Present" : "Missing",
          serviceRoleKey: serviceRoleKey ? "Present" : "Missing",
        },
      })
    }

    console.log(`Creating user: ${email}`)

    // Create Supabase client
    const { createClient } = await import("@supabase/supabase-js")

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create the user
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
    })

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({
        error: `Failed to create user: ${error.message}`,
        debug: {
          supabaseError: error.message,
        },
      })
    }

    console.log("User created successfully:", user.user?.id)

    return NextResponse.json({
      success: true,
      message: `User ${email} created successfully!`,
      user: {
        id: user.user?.id,
        email: user.user?.email,
        created_at: user.user?.created_at,
      },
    })
  } catch (error: any) {
    console.error("=== Unexpected error in create user API ===")
    console.error("Error:", error)

    return NextResponse.json({
      error: `Unexpected error: ${error.message}`,
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message,
      },
    })
  }
}
