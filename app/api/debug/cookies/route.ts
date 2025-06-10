import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Get all cookies
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll().map((c) => ({
      name: c.name,
      value: c.name.includes("supabase") ? "[REDACTED]" : c.value.substring(0, 10) + "...",
      path: c.path || "/",
      secure: !!c.secure,
    }))

    // Return basic info without trying to create Supabase client
    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      cookies: allCookies,
      cookieCount: allCookies.length,
      hasSupabaseCookies: allCookies.some((c) => c.name.includes("supabase")),
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Debug Cookies API Error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: process.env.NODE_ENV !== "production" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
