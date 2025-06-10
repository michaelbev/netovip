import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Use empty strings as fallbacks during build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // Skip Supabase auth check if environment variables are missing
  if (!supabaseUrl || !supabaseAnonKey) {
    return res
  }

  // Create Supabase client
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        res.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: CookieOptions) {
        res.cookies.set({
          name,
          value: "",
          ...options,
        })
      },
    },
  })

  // Check if user is authenticated
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // Handle authentication routes
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup")

  // Allow public routes
  const isPublicRoute =
    isAuthRoute ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname === "/"

  // If no session and trying to access protected route, redirect to login
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If has session but on auth route, redirect to dashboard
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // If authenticated, check tenant association (but don't block if missing)
  if (session && !isAuthRoute && !req.nextUrl.pathname.startsWith("/api")) {
    try {
      // Get user profile with company_id
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", session.user.id).single()

      // If no company associated and not on signup page, redirect to signup
      if (
        !profile?.company_id &&
        !req.nextUrl.pathname.startsWith("/signup") &&
        !req.nextUrl.pathname.startsWith("/onboarding")
      ) {
        return NextResponse.redirect(new URL("/signup", req.url))
      }

      // Add tenant ID to request headers for API routes
      if (profile?.company_id && req.nextUrl.pathname.startsWith("/api")) {
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set("x-tenant-id", profile.company_id)
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch (error) {
      // If profile lookup fails, don't block - let the app handle it
      console.warn("Profile lookup failed in middleware:", error)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
