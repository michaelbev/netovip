import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email and password are required",
      })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase environment variables",
      })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, anonKey)

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        message: `Login failed: ${error.message}`,
        details: {
          errorCode: error.status,
          errorName: error.name,
          email: email,
          timestamp: new Date().toISOString(),
        },
      })
    }

    if (data.user) {
      // Check user details
      const userDetails = {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: !!data.user.email_confirmed_at,
        createdAt: data.user.created_at,
        lastSignIn: data.user.last_sign_in_at,
        userMetadata: data.user.user_metadata,
      }

      return NextResponse.json({
        success: true,
        message: "Login successful!",
        details: {
          user: userDetails,
          session: {
            accessToken: data.session?.access_token ? "Present" : "Missing",
            refreshToken: data.session?.refresh_token ? "Present" : "Missing",
            expiresAt: data.session?.expires_at,
          },
        },
      })
    }

    return NextResponse.json({
      success: false,
      error: "Unknown error - no user returned",
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Unexpected error: ${error.message}`,
      details: {
        errorType: error.constructor.name,
        stack: process.env.NODE_ENV === "development" ? error.stack : "Hidden",
      },
    })
  }
}
