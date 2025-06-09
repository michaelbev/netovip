import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Check if we can create a client
    console.log("Supabase client created")

    // Try to get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Auth check result:", { user: user?.id, error: authError })

    if (authError) {
      return NextResponse.json({
        error: "Auth error",
        details: authError.message,
        code: authError.status,
      })
    }

    if (!user) {
      return NextResponse.json({
        error: "No user found",
        message: "User is not authenticated",
      })
    }

    // Try to get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    console.log("Profile check result:", { profile, error: profileError })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile,
      profileError,
    })
  } catch (error: any) {
    console.error("Debug auth error:", error)
    return NextResponse.json({
      error: "Server error",
      message: error.message,
      stack: error.stack,
    })
  }
}
