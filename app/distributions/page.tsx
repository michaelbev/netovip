"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, PieChart, Users, DollarSign, Calendar, Loader2 } from "lucide-react"

interface Distribution {
  id: string
  period_start: string
  period_end: string
  total_amount: number
  status: string
  distribution_date?: string
  owner_count: number
}

export default function DistributionsPage() {
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDistributions()
  }, [])

  const fetchDistributions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/distributions")

      if (!response.ok) {
        throw new Error("Failed to fetch distributions")
      }

      const data = await response.json()
      setDistributions(data.distributions || [])
    } catch (err: any) {
      console.error("Error fetching distributions:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatPeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
  }

  const totalDistributed = distributions
    .filter((d) => d.status === "completed")
    .reduce((sum, dist) => sum + dist.total_amount, 0)

  const pendingDistributions = distributions.filter((d) => d.status === "pending")
  const pendingAmount = pendingDistributions.reduce((sum, dist) => sum + dist.total_amount, 0)

  const avgDistribution =
    distributions.length > 0 ? totalDistributed / distributions.filter((d) => d.status === "completed").length : 0

  const maxOwners = Math.max(...distributions.map((d) => d.owner_count), 0)

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
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Distributions" description="Manage revenue distributions to owners">
          <Button onClick={fetchDistributions}>
            <Plus className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading distributions: {error}</p>
            <Button onClick={fetchDistributions}>Try Again</Button>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDistributed)}</div>
              <p className="text-xs text-gray-600">Completed distributions</p>
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
            <CardDescription>Track all revenue distributions to owners</CardDescription>
          </CardHeader>
          <CardContent>
            {distributions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No distributions found</p>
                <Button className="mt-4">
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
                  {distributions.map((distribution) => (
                    <TableRow key={distribution.id}>
                      <TableCell className="font-medium">
                        {formatPeriod(distribution.period_start, distribution.period_end)}
                      </TableCell>
                      <TableCell className="text-green-600">{formatCurrency(distribution.total_amount)}</TableCell>
                      <TableCell>{distribution.owner_count}</TableCell>
                      <TableCell>
                        <Badge variant={distribution.status === "completed" ? "default" : "secondary"}>
                          {distribution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {distribution.distribution_date
                          ? formatDate(distribution.distribution_date)
                          : "Not distributed"}
                      </TableCell>
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
