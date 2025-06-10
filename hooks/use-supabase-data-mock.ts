"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context-mock"

// Mock data for demo
const MOCK_WELLS = [
  {
    id: "well-1",
    name: "Eagle Ford #23",
    api_number: "42-123-45678",
    location: "Section 12, T5S R8E",
    county: "Karnes",
    state: "TX",
    status: "active",
    well_type: "oil",
    spud_date: "2023-03-15",
    completion_date: "2023-05-20",
    total_depth: "8500",
    daily_production: 45.2,
    monthly_revenue: 89500,
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "well-2",
    name: "Permian #18",
    api_number: "42-456-78901",
    location: "Section 8, T2N R3W",
    county: "Midland",
    state: "TX",
    status: "active",
    well_type: "oil",
    spud_date: "2023-01-10",
    completion_date: "2023-03-25",
    total_depth: "9200",
    daily_production: 62.8,
    monthly_revenue: 124600,
    updated_at: "2024-01-14T14:20:00Z",
  },
  {
    id: "well-3",
    name: "Bakken #31",
    api_number: "33-789-01234",
    location: "Section 15, T154N R95W",
    county: "McKenzie",
    state: "ND",
    status: "active",
    well_type: "oil",
    spud_date: "2023-06-01",
    completion_date: "2023-08-15",
    total_depth: "10500",
    daily_production: 38.5,
    monthly_revenue: 76200,
    updated_at: "2024-01-16T09:15:00Z",
  },
  {
    id: "well-4",
    name: "Haynesville #12",
    api_number: "17-234-56789",
    location: "Section 22, T18N R14W",
    county: "Caddo",
    state: "LA",
    status: "inactive",
    well_type: "gas",
    spud_date: "2022-11-20",
    completion_date: "2023-01-30",
    total_depth: "11800",
    daily_production: 0,
    monthly_revenue: 0,
    updated_at: "2024-01-10T16:45:00Z",
  },
]

const MOCK_REVENUE = [
  {
    id: "rev-1",
    well_id: "well-1",
    well_name: "Eagle Ford #23",
    date: "2024-01-15",
    amount: 2980,
    volume: 45.2,
    price_per_barrel: 65.93,
    type: "oil_sale",
  },
  {
    id: "rev-2",
    well_id: "well-2",
    well_name: "Permian #18",
    date: "2024-01-15",
    amount: 4145,
    volume: 62.8,
    price_per_barrel: 66.0,
    type: "oil_sale",
  },
  {
    id: "rev-3",
    well_id: "well-3",
    well_name: "Bakken #31",
    date: "2024-01-15",
    amount: 2541,
    volume: 38.5,
    price_per_barrel: 66.0,
    type: "oil_sale",
  },
]

const MOCK_EXPENSES = [
  {
    id: "exp-1",
    well_id: "well-1",
    well_name: "Eagle Ford #23",
    date: "2024-01-10",
    amount: 1250,
    description: "Routine maintenance",
    category: "maintenance",
  },
  {
    id: "exp-2",
    well_id: "well-2",
    well_name: "Permian #18",
    date: "2024-01-12",
    amount: 850,
    description: "Equipment repair",
    category: "repair",
  },
]

const MOCK_OWNERS = [
  {
    id: "owner-1",
    name: "John Smith",
    email: "john.smith@email.com",
    ownership_percentage: 25.5,
    address: "123 Main St, Houston, TX 77001",
    phone: "(713) 555-0123",
  },
  {
    id: "owner-2",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    ownership_percentage: 18.2,
    address: "456 Oak Ave, Dallas, TX 75201",
    phone: "(214) 555-0456",
  },
  {
    id: "owner-3",
    name: "Demo Oil & Gas Company",
    email: "admin@demooilgas.com",
    ownership_percentage: 56.3,
    address: "789 Energy Blvd, Austin, TX 78701",
    phone: "(512) 555-0789",
  },
]

const MOCK_PRODUCTION = [
  {
    id: "prod-1",
    well_id: "well-1",
    well_name: "Eagle Ford #23",
    date: "2024-01-15",
    oil_volume: 45.2,
    gas_volume: 125.8,
    water_volume: 89.3,
  },
  {
    id: "prod-2",
    well_id: "well-2",
    well_name: "Permian #18",
    date: "2024-01-15",
    oil_volume: 62.8,
    gas_volume: 156.2,
    water_volume: 112.5,
  },
  {
    id: "prod-3",
    well_id: "well-3",
    well_name: "Bakken #31",
    date: "2024-01-15",
    oil_volume: 38.5,
    gas_volume: 98.7,
    water_volume: 67.2,
  },
]

interface UseSupabaseDataOptions {
  enabled?: boolean
  refetchInterval?: number
}

export function useSupabaseData<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  dependencies: any[] = [],
  options: UseSupabaseDataOptions = {},
) {
  const { enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const { user, session, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!enabled || authLoading) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 300))
        const result = await queryFn()
        setData(result.data)
        setError(result.error)
      } catch (err) {
        setError(err)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [enabled, authLoading, user, session, ...dependencies])

  const refetch = () => {
    if (!authLoading && user && session) {
      setLoading(true)
      setTimeout(async () => {
        try {
          const result = await queryFn()
          setData(result.data)
          setError(result.error)
        } catch (err) {
          setError(err)
          setData(null)
        } finally {
          setLoading(false)
        }
      }, 300)
    }
  }

  return { data, loading, error, refetch }
}

export function useWells() {
  return useSupabaseData(
    async () => {
      // Return mock wells data
      return { data: MOCK_WELLS, error: null }
    },
    [],
    { enabled: true },
  )
}

export function useRevenue() {
  return useSupabaseData(
    async () => {
      // Return mock revenue data
      return { data: MOCK_REVENUE, error: null }
    },
    [],
    { enabled: true },
  )
}

export function useExpenses() {
  return useSupabaseData(
    async () => {
      // Return mock expenses data
      return { data: MOCK_EXPENSES, error: null }
    },
    [],
    { enabled: true },
  )
}

export function useOwners() {
  return useSupabaseData(
    async () => {
      // Return mock owners data
      return { data: MOCK_OWNERS, error: null }
    },
    [],
    { enabled: true },
  )
}

export function useProduction() {
  return useSupabaseData(
    async () => {
      // Return mock production data
      return { data: MOCK_PRODUCTION, error: null }
    },
    [],
    { enabled: true },
  )
}

// Legacy hook for backward compatibility
export function useSupabaseDataLegacy() {
  const wells = useWells()
  const revenue = useRevenue()
  const owners = useOwners()
  const production = useProduction()

  return {
    wells: wells.data || [],
    revenue: revenue.data || [],
    owners: owners.data || [],
    production: production.data || [],
    loading: wells.loading || revenue.loading || owners.loading || production.loading,
    error: wells.error || revenue.error || owners.error || production.error,
    refetch: () => {
      wells.refetch()
      revenue.refetch()
      owners.refetch()
      production.refetch()
    },
  }
}
