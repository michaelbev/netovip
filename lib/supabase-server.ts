import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

// Cache for server client instances per request
const serverClientCache = new Map<string, any>()

export async function createClient() {
  const cookieStore = await cookies()

  // Create a cache key based on cookies to ensure we reuse clients within the same request
  const cookieString = cookieStore.toString()

  if (serverClientCache.has(cookieString)) {
    return serverClientCache.get(cookieString)
  }

  const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })

  // Cache the client for this request
  serverClientCache.set(cookieString, client)

  // Clean up cache after a reasonable time to prevent memory leaks
  setTimeout(() => {
    serverClientCache.delete(cookieString)
  }, 60000) // 1 minute

  return client
}
