import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json()

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

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found",
      })
    }

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword })

    if (error) {
      console.error("Error updating password:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        updated_at: data.user.updated_at,
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
