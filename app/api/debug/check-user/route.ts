import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

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
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("Error listing users:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
      })
    }

    const user = data.users.find((u) => u.email === email)

    return NextResponse.json({
      success: true,
      exists: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata,
            banned_until: user.banned_until,
            phone: user.phone,
          }
        : null,
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}
