import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  // Ensure environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const isDev = process.env.NODE_ENV === "development"
    const errorMsg = `Missing Supabase environment variables: ${!supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL " : ""}${!supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : ""}`

    if (isDev) {
      console.error("Server-side Supabase client error:", errorMsg)
      console.log(
        "Available server env vars:",
        Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
      )
    }

    throw new Error(errorMsg)
  }

  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          if (process.env.NODE_ENV === "development") {
            console.log("Cookie set error (can be ignored):", error)
          }
        }
      },
    },
  })

  return client
}
