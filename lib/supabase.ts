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
      supabaseInstance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            // Reduce auth refresh frequency to prevent loops
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false, // Prevent URL-based session detection loops
            // Use a unique storage key to prevent conflicts
            storageKey: "oil-gas-accounting-auth",
          },
          global: {
            // Add request deduplication
            headers: {
              "X-Client-Info": "oil-gas-accounting@1.0.0",
            },
          },
        },
      )
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

// Also export as named export for direct import

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
