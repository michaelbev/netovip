import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("=== Session Test API ===")

    // Check cookies first
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    const authCookies = allCookies.filter((cookie) => cookie.name.includes("supabase"))

    console.log(
      "Available cookies:",
      allCookies.map((c) => c.name),
    )
    console.log(
      "Auth cookies:",
      authCookies.map((c) => ({ name: c.name, hasValue: !!c.value })),
    )

    // Create Supabase client
    const supabase = await createClient()

    // Test auth methods
    const userResult = await supabase.auth.getUser()
    const sessionResult = await supabase.auth.getSession()

    console.log("User result:", {
      hasUser: !!userResult.data.user,
      userId: userResult.data.user?.id,
      userError: userResult.error?.message,
    })

    console.log("Session result:", {
      hasSession: !!sessionResult.data.session,
      sessionError: sessionResult.error?.message,
    })

    return NextResponse.json({
      success: true,
      cookies: {
        total: allCookies.length,
        authCookies: authCookies.map((c) => ({ name: c.name, hasValue: !!c.value })),
      },
      auth: {
        user: userResult.data.user
          ? {
              id: userResult.data.user.id,
              email: userResult.data.user.email,
            }
          : null,
        userError: userResult.error?.message,
        session: sessionResult.data.session
          ? {
              hasAccessToken: !!sessionResult.data.session.access_token,
              expiresAt: sessionResult.data.session.expires_at,
            }
          : null,
        sessionError: sessionResult.error?.message,
      },
    })
  } catch (error: any) {
    console.error("Session test error:", error)
    return NextResponse.json(
      {
        error: "Session test failed",
        details: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
