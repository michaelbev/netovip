"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Well {
  id: string
  name: string
  status: string
  company_id: string
  created_at: string
}

interface Revenue {
  id: string
  amount: number
  well_id: string
  company_id: string
  production_month: string
  status: string
}

export function useWells() {
  const [wells, setWells] = useState<Well[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWells() {
      try {
        const response = await fetch("/api/wells")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch wells")
        }

        setWells(data.wells || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchWells()

    // Set up real-time subscription
    const channel = supabase
      .channel("wells-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wells" }, (payload) => {
        console.log("Wells change received!", payload)
        fetchWells() // Refetch data on changes
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { wells, loading, error }
}

export function useRevenue() {
  const [revenue, setRevenue] = useState<Revenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const response = await fetch("/api/revenue")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch revenue")
        }

        setRevenue(data.revenue || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()

    // Set up real-time subscription
    const channel = supabase
      .channel("revenue-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "revenue" }, (payload) => {
        console.log("Revenue change received!", payload)
        fetchRevenue()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { revenue, loading, error }
}

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    activeWells: 0,
    totalOwners: 0,
    pendingDistributions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch aggregated statistics
        const [revenueRes, wellsRes] = await Promise.all([fetch("/api/revenue"), fetch("/api/wells")])

        const [revenueData, wellsData] = await Promise.all([revenueRes.json(), wellsRes.json()])

        const totalRevenue = revenueData.revenue?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0
        const activeWells = wellsData.wells?.filter((w: any) => w.status === "active").length || 0

        setStats({
          totalRevenue,
          totalExpenses: 1245800, // Mock data for now
          activeWells,
          totalOwners: 156, // Mock data for now
          pendingDistributions: 12, // Mock data for now
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading }
}
