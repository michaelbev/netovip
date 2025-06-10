import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

console.log("Supabase ENV Vars:", {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

export async function createClient() {
  const cookieStore = await cookies()
  console.log("Server cookies:", cookieStore.getAll())

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
      get(name: string) {
        const cookie = cookieStore.get(name)
        if (!cookie) return undefined
        
        // Remove base64- prefix if present
        if (name === 'oil-gas-accounting-auth' && cookie.value.startsWith('base64-')) {
          return cookie.value.replace('base64-', '')
        }
        return cookie.value
      },
      set(name: string, value: string, options: any) {
        try {
          // Add base64- prefix to auth cookie
          if (name === 'oil-gas-accounting-auth') {
            cookieStore.set(name, `base64-${value}`, options)
          } else {
            cookieStore.set(name, value, options)
          }
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          if (process.env.NODE_ENV === "development") {
            console.log("Cookie set error (can be ignored):", error)
          }
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete(name)
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.log("Cookie remove error (can be ignored):", error)
          }
        }
      },
    },
  })

  return client
}
