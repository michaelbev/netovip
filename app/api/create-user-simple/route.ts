import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Create admin client directly with hardcoded values
    const supabase = createClient(
      "https://ygmysskhrhojvkkrcbkl.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbXlzc2tocmhvanZra3JjYmtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQ5NDQ0OCwiZXhwIjoyMDY1MDcwNDQ4fQ.toeYcnyVM1x10QPDxgXnSH6EmfhLx1nsdtBgmigpO3M",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    console.log("Creating user with admin client:", email)

    // Create user with admin client (bypasses email confirmation)
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
    })

    if (error) {
      console.error("Admin create user error:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
      })
    }

    console.log("✅ User created successfully:", data.user?.id)

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: data.user?.id,
        email: data.user?.email,
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
