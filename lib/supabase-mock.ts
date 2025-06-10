// Override the main supabase client with mock for demo
import { createMockClient } from "./mock-auth"

// Export the mock client as the main client
export const supabase = createMockClient()
export const createClient = createMockClient
export function getSupabaseClient() {
  return createMockClient()
}

// Re-export types for compatibility
export type { Database } from "./supabase"
