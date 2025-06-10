import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === "development"

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Log environment info in development
  if (isDev) {
    console.log("Middleware - Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseAnonKey,
      url: request.url,
    })
  }

  // Skip middleware if environment variables are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables in middleware")
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Refresh session if expired - required for Server Components
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Enhanced logging for development
    if (isDev) {
      if (error) {
        console.log("Middleware auth error:", error.message)
      } else if (user) {
        console.log("Middleware: User authenticated:", user.email)
      } else {
        console.log("Middleware: No authenticated user")
      }
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
