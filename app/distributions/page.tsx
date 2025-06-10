"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, PieChart, Users, DollarSign, Calendar, Loader2, Info } from "lucide-react"

interface Distribution {
  id: string
  period_start: string
  period_end: string
  total_amount: number
  status: string
  distribution_date?: string | null
  owner_count: number
}

interface ApiResponse {
  distributions: Distribution[]
  demo?: boolean
  message?: string
}

export default function DistributionsPage() {
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [demoMessage, setDemoMessage] = useState<string>("")

  useEffect(() => {
    fetchDistributions()
  }, [])

  const fetchDistributions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/distributions")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()

      // Ensure we always have an array
      const distributionsData = Array.isArray(data.distributions) ? data.distributions : []

      setDistributions(distributionsData)
      setIsDemo(data.demo || false)
      setDemoMessage(data.message || "")

      console.log(`✅ Loaded ${distributionsData.length} distributions`, data.demo ? "(demo mode)" : "(live data)")
    } catch (err: any) {
      console.error("Error fetching distributions:", err)
      setError(err.message || "Failed to fetch distributions")

      // Fallback to empty array to prevent crashes
      setDistributions([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount && amount !== 0) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not set"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid date"
    }
  }

  const formatPeriod = (startDate: string, endDate: string) => {
    try {
      const start = new Date(startDate)
      return start.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    } catch {
      return "Invalid period"
    }
  }

  // Safe calculations with null checks
  const safeDistributions = Array.isArray(distributions) ? distributions : []

  const totalDistributed = safeDistributions
    .filter((d) => d?.status === "completed")
    .reduce((sum, dist) => sum + (dist?.total_amount || 0), 0)

  const pendingDistributions = safeDistributions.filter((d) => d?.status === "pending")
  const pendingAmount = pendingDistributions.reduce((sum, dist) => sum + (dist?.total_amount || 0), 0)

  const completedDistributions = safeDistributions.filter((d) => d?.status === "completed")
  const avgDistribution = completedDistributions.length > 0 ? totalDistributed / completedDistributions.length : 0

  const maxOwners = safeDistributions.length > 0 ? Math.max(...safeDistributions.map((d) => d?.owner_count || 0), 0) : 0

  if (loading) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Distributions" description="Manage revenue distributions to owners">
          <Button disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-gray-600">Loading distributions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Distributions" description="Manage revenue distributions to owners">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Distribution
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Demo Mode Alert */}
        {isDemo && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> {demoMessage || "Showing sample data for demonstration purposes"}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error}
              <Button variant="outline" size="sm" className="ml-2" onClick={fetchDistributions}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDistributed)}</div>
              <p className="text-xs text-gray-600">{completedDistributions.length} completed distributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Owners</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{maxOwners}</div>
              <p className="text-xs text-gray-600">Receiving distributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-gray-600">{pendingDistributions.length} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Distribution</CardTitle>
              <PieChart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgDistribution)}</div>
              <p className="text-xs text-gray-600">Per period</p>
            </CardContent>
          </Card>
        </div>

        {/* Distributions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution History</CardTitle>
            <CardDescription>
              Track all revenue distributions to owners
              {isDemo && <span className="text-orange-600 ml-2">(Demo Data)</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {safeDistributions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  {error ? "Unable to load distributions" : "No distributions found"}
                </p>
                <Button onClick={fetchDistributions} variant="outline" className="mr-2">
                  <Loader2 className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Distribution
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Number of Owners</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Distribution Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeDistributions.map((distribution) => (
                    <TableRow key={distribution?.id || Math.random()}>
                      <TableCell className="font-medium">
                        {formatPeriod(distribution?.period_start || "", distribution?.period_end || "")}
                      </TableCell>
                      <TableCell className="text-green-600">{formatCurrency(distribution?.total_amount)}</TableCell>
                      <TableCell>{distribution?.owner_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={distribution?.status === "completed" ? "default" : "secondary"}>
                          {distribution?.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(distribution?.distribution_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
