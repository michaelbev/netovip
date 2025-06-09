"use client"

import { useState, useEffect, useRef } from "react"
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

  // Use refs to prevent multiple simultaneous requests
  const fetchingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchWithRetry = async (url: string, retries = 2): Promise<any> => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
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
        if (err.name === "AbortError") {
          console.log("Request was aborted")
          throw err
        }

        if (i === retries - 1) throw err
        console.log(`Request failed, retrying... (${i + 1}/${retries}):`, err.message)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  const fetchData = async () => {
    if (authLoading || !session || fetchingRef.current) {
      console.log("Skipping fetch - auth loading, no session, or already fetching")
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      setError(null)

      console.log("Fetching data with session:", session.user.email)

      // Fetch wells
      try {
        const wellsData = await fetchWithRetry("/api/wells")
        setWells(wellsData.wells || [])
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Wells fetch error:", err)
          setError(err.message)
        }
      }

      // Fetch revenue
      try {
        const revenueData = await fetchWithRetry("/api/revenue")
        setRevenue(revenueData.revenue || [])
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Revenue fetch error:", err)
          setError(err.message)
        }
      }

      // Set empty arrays for now
      setOwners([])
      setProduction([])

      console.log("Data fetched successfully")
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error fetching data:", err)
        setError(err.message)
      }
    } finally {
      fetchingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    // Cleanup function to abort requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

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
