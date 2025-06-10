"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock, Loader2, Calendar, DollarSign } from "lucide-react"
import { useAuth } from "@/contexts/auth-context-mock"

interface MaintenanceRecord {
  id: string
  maintenance_type: string
  priority: string
  status: string
  scheduled_date: string
  completed_date?: string
  description?: string
  cost?: number
  wells: { name: string }
}

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      fetchMaintenance()
    }
  }, [authLoading])

  const fetchMaintenance = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/maintenance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      // Handle both success and fallback scenarios
      if (data.maintenance) {
        setMaintenance(data.maintenance)
      } else {
        throw new Error(data.error || "No maintenance data received")
      }
    } catch (err: any) {
      console.error("Error fetching maintenance:", err)
      setError(err.message)

      // Fallback to demo data if API fails
      setMaintenance([
        {
          id: "demo-1",
          maintenance_type: "Demo Inspection",
          priority: "medium",
          status: "completed",
          scheduled_date: "2024-01-10",
          completed_date: "2024-01-10",
          description: "Demo maintenance record",
          cost: 850,
          wells: { name: "Demo Well #1" },
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "scheduled":
        return <Calendar className="w-4 h-4 text-orange-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "scheduled":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Calculate summary statistics
  const totalTasks = maintenance.length
  const inProgress = maintenance.filter((m) => m.status === "in_progress").length
  const overdue = maintenance.filter((m) => m.status === "overdue").length
  const completed = maintenance.filter((m) => m.status === "completed").length
  const scheduled = maintenance.filter((m) => m.status === "scheduled").length
  const totalCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0)

  if (authLoading || loading) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Maintenance" description="Schedule and track well maintenance activities">
          <Button disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading maintenance records...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Maintenance" description="Schedule and track well maintenance activities">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Maintenance
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {error && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Demo Mode: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Wrench className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-gray-600">Active maintenance tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inProgress}</div>
              <p className="text-xs text-gray-600">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdue}</div>
              <p className="text-xs text-gray-600">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completed}</div>
              <p className="text-xs text-gray-600">This period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
              <p className="text-xs text-gray-600">All maintenance</p>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedule</CardTitle>
            <CardDescription>Track all well maintenance activities and schedules</CardDescription>
          </CardHeader>
          <CardContent>
            {maintenance.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No maintenance records found</p>
                <p className="text-sm text-gray-400 mb-4">Schedule your first maintenance task to get started</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule First Maintenance
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Well</TableHead>
                      <TableHead>Maintenance Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenance.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.wells.name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.maintenance_type}</div>
                            {item.description && <div className="text-sm text-gray-500 mt-1">{item.description}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(item.priority) as any}>{item.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{formatDate(item.scheduled_date)}</div>
                            {item.completed_date && (
                              <div className="text-sm text-green-600">Completed: {formatDate(item.completed_date)}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.cost ? formatCurrency(item.cost) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
