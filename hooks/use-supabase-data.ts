"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"

interface UseSupabaseDataReturn {
  wells: any[]
  revenue: any[]
  owners: any[]
  production: any[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSupabaseData(): UseSupabaseDataReturn {
  const { session, loading: authLoading } = useAuth()
  const [wells, setWells] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])
  const [production, setProduction] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWithRetry = async (url: string, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (errorData.retry && i < retries - 1) {
            console.log(`Request failed, retrying... (${i + 1}/${retries})`)
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
            continue
          }
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        return await response.json()
      } catch (err: any) {
        if (i === retries - 1) throw err
        console.log(`Request failed, retrying... (${i + 1}/${retries}):`, err.message)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  const fetchData = async () => {
    if (authLoading || !session) {
      console.log("Skipping fetch - auth loading or no session")
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Fetching data with session:", session.user.email)

      // Fetch wells with retry
      const wellsData = await fetchWithRetry("/api/wells")
      setWells(wellsData.wells || [])

      // Fetch revenue with retry
      const revenueData = await fetchWithRetry("/api/revenue")
      setRevenue(revenueData.revenue || [])

      // Set empty arrays for now
      setOwners([])
      setProduction([])

      console.log("Data fetched successfully:", {
        wells: wellsData.wells?.length || 0,
        revenue: revenueData.revenue?.length || 0,
      })
    } catch (err: any) {
      console.error("Error fetching data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [session, authLoading])

  return {
    wells,
    revenue,
    owners,
    production,
    loading: loading || authLoading,
    error,
    refetch: fetchData,
  }
}

// Individual hooks for specific data
export function useWells() {
  const { wells, loading, error, refetch } = useSupabaseData()
  return { wells, loading, error, refetch }
}

export function useRevenue() {
  const { revenue, loading, error, refetch } = useSupabaseData()
  return { revenue, loading, error, refetch }
}

export function useOwners() {
  const { owners, loading, error, refetch } = useSupabaseData()
  return { owners, loading, error, refetch }
}

export function useProduction() {
  const { production, loading, error, refetch } = useSupabaseData()
  return { production, loading, error, refetch }
}
