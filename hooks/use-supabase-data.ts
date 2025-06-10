"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"

interface UseSupabaseDataOptions {
  enabled?: boolean
  refetchInterval?: number
}

export function useSupabaseData<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  dependencies: any[] = [],
  options: UseSupabaseDataOptions = {},
) {
  const { enabled = true, refetchInterval } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const { user, session, loading: authLoading } = useAuth()

  // Prevent multiple simultaneous requests
  const requestInProgress = useRef(false)
  const mountedRef = useRef(true)

  const fetchData = async () => {
    // Don't fetch if auth is still loading, no user, or no session
    if (authLoading || !user || !session || !enabled || requestInProgress.current) {
      console.log("Skipping fetch:", { authLoading, hasUser: !!user, hasSession: !!session, enabled })
      return
    }

    requestInProgress.current = true
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching data for user:", user.email)

      // Wait a bit longer to ensure cookies are properly set
      await new Promise((resolve) => setTimeout(resolve, 500))

      const result = await queryFn()

      if (!mountedRef.current) return

      if (result.error) {
        console.error("Data fetch error:", result.error)

        // If it's an auth error, try to debug session
        if (
          result.error.includes("Authentication") ||
          result.error.includes("Auth") ||
          result.error.includes("session")
        ) {
          console.log("Auth error detected, checking session...")
          try {
            const debugResponse = await fetch("/api/debug/session-test", {
              credentials: "include",
            })
            const debugData = await debugResponse.json()
            console.log("Session debug info:", debugData)
          } catch (debugError) {
            console.error("Failed to debug session:", debugError)
          }
        }

        setError(result.error)
        setData(null)
      } else {
        setData(result.data)
        setError(null)
      }
    } catch (err) {
      console.error("Data fetch exception:", err)
      if (mountedRef.current) {
        setError(err)
        setData(null)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        requestInProgress.current = false
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true

    // Only fetch when auth is ready, user is authenticated, and has a session
    if (!authLoading && user && session && enabled) {
      // Add a longer delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          fetchData()
        }
      }, 1000) // Increased delay

      return () => clearTimeout(timer)
    } else if (!authLoading && (!user || !session)) {
      // Clear data when user is not authenticated or no session
      setData(null)
      setLoading(false)
      setError(null)
    }

    return () => {
      mountedRef.current = false
    }
  }, [user, session, authLoading, enabled, ...dependencies])

  // Set up refetch interval if specified
  useEffect(() => {
    if (!refetchInterval || !enabled || authLoading || !user || !session) return

    const interval = setInterval(() => {
      if (!requestInProgress.current) {
        fetchData()
      }
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, enabled, user, session, authLoading])

  const refetch = () => {
    if (!requestInProgress.current && user && session) {
      fetchData()
    }
  }

  return { data, loading, error, refetch }
}

// Specific hooks for different data types with enhanced debugging
export function useWells() {
  const { user, session } = useAuth()

  return useSupabaseData(
    async () => {
      if (!user || !session) return { data: null, error: null }

      const response = await fetch("/api/wells", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.error || `HTTP ${response.status}` }
      }

      const result = await response.json()
      return { data: result.wells || [], error: null }
    },
    [user?.id, session?.access_token],
    { enabled: !!(user && session) },
  )
}

export function useRevenue() {
  const { user, session } = useAuth()

  return useSupabaseData(
    async () => {
      if (!user || !session) {
        console.log("useRevenue: No user or session")
        return { data: null, error: null }
      }

      console.log("useRevenue: Making request with user:", user.email)

      const response = await fetch("/api/revenue", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent
      })

      console.log("useRevenue: Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("useRevenue: Error response:", errorData)
        return { data: null, error: errorData.error || `HTTP ${response.status}` }
      }

      const result = await response.json()
      console.log("useRevenue: Success, got", result.revenue?.length || 0, "records")
      return { data: result.revenue || [], error: null }
    },
    [user?.id, session?.access_token],
    { enabled: !!(user && session) },
  )
}

export function useExpenses() {
  const { user, session } = useAuth()

  return useSupabaseData(
    async () => {
      if (!user || !session) return { data: null, error: null }

      const response = await fetch("/api/expenses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.error || `HTTP ${response.status}` }
      }

      const result = await response.json()
      return { data: result.expenses || [], error: null }
    },
    [user?.id, session?.access_token],
    { enabled: !!(user && session) },
  )
}

export function useOwners() {
  const { user, session } = useAuth()

  return useSupabaseData(
    async () => {
      if (!user || !session) return { data: null, error: null }

      const response = await fetch("/api/owners", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.error || `HTTP ${response.status}` }
      }

      const result = await response.json()
      return { data: result.owners || [], error: null }
    },
    [user?.id, session?.access_token],
    { enabled: !!(user && session) },
  )
}

export function useProduction() {
  const { user, session } = useAuth()

  return useSupabaseData(
    async () => {
      if (!user || !session) return { data: null, error: null }

      const response = await fetch("/api/production", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.error || `HTTP ${response.status}` }
      }

      const result = await response.json()
      return { data: result.production || [], error: null }
    },
    [user?.id, session?.access_token],
    { enabled: !!(user && session) },
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
