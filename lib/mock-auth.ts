import type { User, Session } from "@supabase/supabase-js"

// Mock user data for demo
const MOCK_USER: User = {
  id: "demo-user-123",
  email: "demo@oilgasaccounting.com",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  aud: "authenticated",
  role: "authenticated",
  email_confirmed_at: "2024-01-01T00:00:00.000Z",
  phone_confirmed_at: null,
  confirmation_sent_at: null,
  recovery_sent_at: null,
  email_change_sent_at: null,
  new_email: null,
  invited_at: null,
  action_link: null,
  email_change: null,
  phone: null,
  phone_change: null,
  phone_change_sent_at: null,
  confirmed_at: "2024-01-01T00:00:00.000Z",
  email_change_confirm_status: 0,
  banned_until: null,
  identities: [],
  factors: [],
  app_metadata: {},
  user_metadata: {
    full_name: "Demo User",
    role: "admin",
  },
  is_anonymous: false,
}

const MOCK_SESSION: Session = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: "bearer",
  user: MOCK_USER,
}

const MOCK_COMPANY = {
  id: "demo-company-123",
  name: "Demo Oil & Gas Company",
  email: "contact@demooilgas.com",
  phone: "(555) 123-4567",
  address: "123 Oil Field Road",
  city: "Houston",
  state: "TX",
  zip: "77001",
  country: "USA",
  tax_id: "12-3456789",
  industry: "Oil & Gas",
  description: "Demo oil and gas operations company",
  operator_id: "TX-12345",
  rrc_number: "RRC-67890",
  federal_id: "FED-98765",
  insurance_provider: "Demo Insurance Co.",
  emergency_contact: "(555) 999-8888",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
}

const MOCK_PROFILE = {
  id: "demo-user-123",
  email: "demo@oilgasaccounting.com",
  full_name: "Demo User",
  role: "admin" as const,
  company_id: "demo-company-123",
  created_at: "2024-01-01T00:00:00.000Z",
  updated_at: "2024-01-01T00:00:00.000Z",
  companies: MOCK_COMPANY,
}

/**
 * Creates a mock Supabase client that returns demo data
 */
export const createMockClient = () => {
  return {
    auth: {
      getUser: async () => ({
        data: { user: MOCK_USER },
        error: null,
      }),
      getSession: async () => ({
        data: { session: MOCK_SESSION },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { user: MOCK_USER, session: MOCK_SESSION },
        error: null,
      }),
      signUp: async () => ({
        data: { user: MOCK_USER, session: MOCK_SESSION },
        error: null,
      }),
      signOut: async () => ({
        error: null,
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      setAuth: () => {},
      setSession: async () => ({
        data: { session: MOCK_SESSION },
        error: null,
      }),
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: () => ({
          single: async () => {
            if (table === "profiles") {
              return { data: MOCK_PROFILE, error: null }
            }
            if (table === "companies") {
              return { data: MOCK_COMPANY, error: null }
            }
            return { data: null, error: null }
          },
          limit: () => ({
            then: async (callback: any) => {
              const mockData = getMockTableData(table)
              return callback({ data: mockData, error: null })
            },
          }),
        }),
        order: () => ({
          then: async (callback: any) => {
            const mockData = getMockTableData(table)
            return callback({ data: mockData, error: null })
          },
        }),
        then: async (callback: any) => {
          const mockData = getMockTableData(table)
          return callback({ data: mockData, error: null })
        },
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: MOCK_COMPANY, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: MOCK_COMPANY, error: null }),
          }),
        }),
      }),
    }),
    headers: {} as Record<string, string>,
  }
}

/**
 * Mock tenant isolation - always returns demo company context
 */
export const mockWithTenantIsolation = async (userId?: string, companyId?: string) => {
  return createMockClient()
}

/**
 * Get mock data for different tables
 */
function getMockTableData(table: string) {
  switch (table) {
    case "wells":
      return [
        {
          id: "well-1",
          name: "Eagle Ford #23",
          api_number: "42-123-45678",
          status: "active",
          location: "Eagle Ford Shale, TX",
          spud_date: "2023-01-15",
          completion_date: "2023-03-20",
          total_depth: 8500,
          production_bbl_day: 125,
          monthly_revenue: 89500,
          last_production_date: "2024-01-15",
          company_id: "demo-company-123",
          created_at: "2023-01-15T00:00:00.000Z",
          updated_at: "2024-01-15T00:00:00.000Z",
        },
        {
          id: "well-2",
          name: "Permian #18",
          api_number: "42-987-65432",
          status: "active",
          location: "Permian Basin, TX",
          spud_date: "2023-02-10",
          completion_date: "2023-04-15",
          total_depth: 9200,
          production_bbl_day: 180,
          monthly_revenue: 125000,
          last_production_date: "2024-01-15",
          company_id: "demo-company-123",
          created_at: "2023-02-10T00:00:00.000Z",
          updated_at: "2024-01-15T00:00:00.000Z",
        },
        {
          id: "well-3",
          name: "Bakken #31",
          api_number: "33-456-78901",
          status: "active",
          location: "Bakken Formation, ND",
          spud_date: "2023-03-05",
          completion_date: "2023-05-10",
          total_depth: 10500,
          production_bbl_day: 95,
          monthly_revenue: 68000,
          last_production_date: "2024-01-14",
          company_id: "demo-company-123",
          created_at: "2023-03-05T00:00:00.000Z",
          updated_at: "2024-01-14T00:00:00.000Z",
        },
      ]

    case "revenue":
      return [
        {
          id: "rev-1",
          well_id: "well-1",
          amount: 89500,
          date: "2024-01-01",
          type: "oil_sales",
          description: "January oil sales - Eagle Ford #23",
          company_id: "demo-company-123",
          created_at: "2024-01-01T00:00:00.000Z",
        },
        {
          id: "rev-2",
          well_id: "well-2",
          amount: 125000,
          date: "2024-01-01",
          type: "oil_sales",
          description: "January oil sales - Permian #18",
          company_id: "demo-company-123",
          created_at: "2024-01-01T00:00:00.000Z",
        },
      ]

    case "expenses":
      return [
        {
          id: "exp-1",
          well_id: "well-1",
          amount: 15000,
          date: "2024-01-05",
          type: "maintenance",
          description: "Routine maintenance - Eagle Ford #23",
          company_id: "demo-company-123",
          created_at: "2024-01-05T00:00:00.000Z",
        },
      ]

    case "owners":
      return [
        {
          id: "owner-1",
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "(555) 123-4567",
          address: "456 Main St, Dallas, TX 75201",
          ownership_percentage: 25.5,
          company_id: "demo-company-123",
          created_at: "2023-01-01T00:00:00.000Z",
        },
        {
          id: "owner-2",
          name: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          phone: "(555) 987-6543",
          address: "789 Oak Ave, Austin, TX 78701",
          ownership_percentage: 18.75,
          company_id: "demo-company-123",
          created_at: "2023-01-01T00:00:00.000Z",
        },
      ]

    case "production":
      return [
        {
          id: "prod-1",
          well_id: "well-1",
          date: "2024-01-15",
          oil_bbls: 125,
          gas_mcf: 450,
          water_bbls: 85,
          company_id: "demo-company-123",
          created_at: "2024-01-15T00:00:00.000Z",
        },
        {
          id: "prod-2",
          well_id: "well-2",
          date: "2024-01-15",
          oil_bbls: 180,
          gas_mcf: 620,
          water_bbls: 120,
          company_id: "demo-company-123",
          created_at: "2024-01-15T00:00:00.000Z",
        },
      ]

    default:
      return []
  }
}

// Named exports for direct import
export { MOCK_USER, MOCK_SESSION, MOCK_COMPANY, MOCK_PROFILE }

// Export default for backward compatibility
export default {
  createMockClient,
  mockWithTenantIsolation,
  MOCK_USER,
  MOCK_SESSION,
  MOCK_COMPANY,
  MOCK_PROFILE,
}
