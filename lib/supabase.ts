import { createBrowserClient } from "@supabase/ssr"

// Global singleton instance - only create once per browser session
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null
let isInitializing = false

export function getSupabaseClient() {
  // Prevent multiple initialization attempts
  if (isInitializing) {
    // Wait for the current initialization to complete
    let attempts = 0
    while (isInitializing && !supabaseInstance && attempts < 100) {
      attempts++
      // Small delay to prevent busy waiting
      if (attempts % 10 === 0) {
        console.log("Waiting for Supabase client initialization...")
      }
    }
    if (supabaseInstance) {
      return supabaseInstance
    }
  }

  if (!supabaseInstance) {
    isInitializing = true

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // Enhanced error checking for development
      if (!supabaseUrl || !supabaseAnonKey) {
        const isDev = process.env.NODE_ENV === "development"
        const errorMsg = `Missing Supabase environment variables: ${!supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL " : ""}${!supabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : ""}`

        if (isDev) {
          console.error(errorMsg)
          console.log(
            "Available env vars:",
            Object.keys(process.env).filter((key) => key.includes("SUPABASE")),
          )
        }

        throw new Error(errorMsg)
      }

      supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          // Enhanced settings for development
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true, // Enable for development to handle auth redirects
          // Use a unique storage key to prevent conflicts
          storageKey: "oil-gas-accounting-auth",
          // Add debug mode for development
          debug: process.env.NODE_ENV === "development",
        },
        global: {
          // Add request deduplication
          headers: {
            "X-Client-Info": "oil-gas-accounting@1.0.0",
          },
        },
      })

      // Log successful initialization in development
      if (process.env.NODE_ENV === "development") {
        console.log("Supabase client initialized successfully")
      }
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
      throw error
    } finally {
      isInitializing = false
    }
  }

  return supabaseInstance
}

// Export the singleton instance - this ensures only one instance exists
export const supabase = getSupabaseClient()

// Export createClient function for compatibility with other parts of the app
export function createClient() {
  return getSupabaseClient()
}

// Types for our database tables
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          website: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          country: string | null
          tax_id: string | null
          industry: string | null
          description: string | null
          operator_id: string | null
          rrc_number: string | null
          federal_id: string | null
          insurance_provider: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          tax_id?: string | null
          industry?: string | null
          description?: string | null
          operator_id?: string | null
          rrc_number?: string | null
          federal_id?: string | null
          insurance_provider?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          country?: string | null
          tax_id?: string | null
          industry?: string | null
          description?: string | null
          operator_id?: string | null
          rrc_number?: string | null
          federal_id?: string | null
          insurance_provider?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: "admin" | "accountant" | "operator" | "viewer"
          company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: "admin" | "accountant" | "operator" | "viewer"
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: "admin" | "accountant" | "operator" | "viewer"
          company_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
