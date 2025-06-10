import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
      })
    }

    // Create admin client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // List users and find the one with matching email
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()

    if (userError) {
      console.error("Error listing users:", userError)
      return NextResponse.json({
        success: false,
        error: userError.message,
      })
    }

    const user = userData.users.find((u) => u.email === email)

    // If user exists, delete them
    if (user) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

      if (deleteError) {
        console.error("Error deleting user:", deleteError)
        return NextResponse.json({
          success: false,
          error: deleteError.message,
        })
      }
    }

    // Wait a moment for deletion to propagate
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "User recreated successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
