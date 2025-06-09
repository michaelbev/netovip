"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Wrench, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react"

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

  useEffect(() => {
    fetchMaintenance()
  }, [])

  const fetchMaintenance = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/maintenance")

      if (!response.ok) {
        throw new Error("Failed to fetch maintenance records")
      }

      const data = await response.json()
      setMaintenance(data.maintenance || [])
    } catch (err: any) {
      console.error("Error fetching maintenance:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
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

  const totalTasks = maintenance.length
  const inProgress = maintenance.filter((m) => m.status === "in_progress").length
  const overdue = maintenance.filter((m) => m.status === "overdue").length
  const completed = maintenance.filter((m) => m.status === "completed").length

  if (loading) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Maintenance" description="Schedule and track well maintenance activities">
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
        <PageHeader title="Maintenance" description="Schedule and track well maintenance activities">
          <Button onClick={fetchMaintenance}>
            <Plus className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading maintenance: {error}</p>
            <Button onClick={fetchMaintenance}>Try Again</Button>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-gray-500">No maintenance records found</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule First Maintenance
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Well</TableHead>
                    <TableHead>Maintenance Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenance.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.wells.name}</TableCell>
                      <TableCell>
                        {item.maintenance_type}
                        {item.description && <div className="text-sm text-gray-500">{item.description}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(item.priority) as any}>{item.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="capitalize">{item.status.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(item.scheduled_date)}</TableCell>
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
