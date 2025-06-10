"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { useWells, useRevenue } from "@/hooks/use-supabase-data"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  Users,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Building2,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Create a wrapper component that handles auth context safely
function DashboardContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [needsSetup, setNeedsSetup] = useState(false)
  const [checkingSetup, setCheckingSetup] = useState(true)
  const { wells, loading: wellsLoading, error: wellsError } = useWells()
  const { revenue, loading: revenueLoading, error: revenueError } = useRevenue()

  const loading = authLoading || wellsLoading || revenueLoading
  const error = wellsError || revenueError

  // Calculate stats from actual data
  const stats = {
    totalRevenue: revenue?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0,
    totalExpenses: 1245800, // Mock data for now
    activeWells: wells?.filter((w) => w.status === "active")?.length || 0,
    totalOwners: 156, // Mock data for now
    pendingDistributions: 12, // Mock data for now
  }

  useEffect(() => {
    const checkSetup = async () => {
      if (authLoading) return

      if (!user) {
        router.push("/login")
        return
      }

      try {
        setCheckingSetup(true)
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setNeedsSetup(data.needsSetup || false)
        } else {
          // If auth check fails, assume needs setup
          setNeedsSetup(true)
        }
      } catch (error) {
        console.error("Setup check error:", error)
        setNeedsSetup(true)
      } finally {
        setCheckingSetup(false)
      }
    }

    checkSetup()
  }, [user, authLoading, router])

  // Show loading while checking auth or setup
  if (authLoading || checkingSetup) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push("/login")
    return null
  }

  if (needsSetup) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Setup Required" description="Complete your company setup to continue">
          <Button asChild>
            <Link href="/setup">Complete Setup</Link>
          </Button>
        </PageHeader>
        <div className="flex-1 p-4">
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Company Setup Required</h3>
              <p className="text-gray-600 mb-4">Please complete your company setup to access the dashboard</p>
              <div className="space-y-2">
                <Button asChild>
                  <Link href="/setup">
                    <Building2 className="w-4 h-4 mr-2" />
                    Set Up Company
                  </Link>
                </Button>
                <div className="text-sm text-gray-500">
                  <p>Or try the automatic setup:</p>
                  <Button variant="outline" asChild className="mt-2">
                    <Link href="/debug/production-setup">Auto Setup</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Mock data for demonstration
  const recentTransactions = [
    { id: 1, type: "Revenue", well: "Eagle Ford #23", amount: 15420, date: "2024-01-15", status: "Completed" },
    { id: 2, type: "Expense", well: "Permian #18", amount: -3200, date: "2024-01-14", status: "Pending" },
    { id: 3, type: "Revenue", well: "Bakken #31", amount: 22100, date: "2024-01-13", status: "Completed" },
    { id: 4, type: "Expense", well: "Eagle Ford #23", amount: -1850, date: "2024-01-12", status: "Completed" },
    { id: 5, type: "Revenue", well: "Permian #25", amount: 18750, date: "2024-01-11", status: "Completed" },
  ]

  const topWells = [
    { name: "Eagle Ford #23", production: 1250, revenue: 89500, efficiency: 94 },
    { name: "Permian #18", production: 1180, revenue: 82300, efficiency: 91 },
    { name: "Bakken #31", production: 1050, revenue: 73500, efficiency: 88 },
    { name: "Permian #25", production: 980, revenue: 68600, efficiency: 85 },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col p-4">
        <PageHeader title="Dashboard Error" description="There was a problem loading your dashboard">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </PageHeader>
        <Card className="mt-4 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
            <p className="mt-4">Please try refreshing the page or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Dashboard" description="Oil & Gas Operations Overview">
        <Button asChild>
          <Link href="/wells">
            <Plus className="w-4 h-4 mr-2" />
            View Wells
          </Link>
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-gray-600">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</div>
              <p className="text-xs text-gray-600">
                <span className="text-red-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3.2% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Wells</CardTitle>
              <Droplets className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeWells}</div>
              <p className="text-xs text-gray-600">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2 new wells this month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Owners</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOwners}</div>
              <p className="text-xs text-gray-600">
                <span className="text-orange-600 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {stats.pendingDistributions} pending distributions
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wells">Wells</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Revenue vs Expenses Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance</CardTitle>
                  <CardDescription>Revenue vs Expenses over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would go here</p>
                      <p className="text-sm text-gray-400">Revenue: {formatCurrency(234500)}</p>
                      <p className="text-sm text-gray-400">Expenses: {formatCurrency(89200)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Wells */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Wells</CardTitle>
                  <CardDescription>Wells ranked by revenue and efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topWells.map((well, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{well.name}</p>
                          <p className="text-sm text-gray-600">{well.production} bbl/day</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{formatCurrency(well.revenue)}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={well.efficiency} className="w-16 h-2" />
                            <span className="text-xs text-gray-600">{well.efficiency}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest revenue and expense entries</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Well</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge variant={transaction.type === "Revenue" ? "default" : "secondary"}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.well}</TableCell>
                        <TableCell className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(Math.abs(transaction.amount))}
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.status === "Completed" ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="text-sm">{transaction.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wells">
            <Card>
              <CardHeader>
                <CardTitle>Well Management</CardTitle>
                <CardDescription>Manage your oil & gas wells and production data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Droplets className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Well Management Module</h3>
                  <p className="text-gray-600 mb-4">Comprehensive well tracking and production monitoring</p>
                  <Button asChild>
                    <Link href="/wells">
                      <Plus className="w-4 h-4 mr-2" />
                      Manage Wells
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
                <CardDescription>Detailed view of all revenue and expense transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Transaction History</h3>
                  <p className="text-gray-600 mb-4">Complete transaction management and tracking</p>
                  <div className="flex gap-2 justify-center">
                    <Button asChild>
                      <Link href="/revenue">
                        <Plus className="w-4 h-4 mr-2" />
                        View Revenue
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Error boundary component
function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = () => setHasError(true)
    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">There was a problem with the authentication system.</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Main dashboard component with error boundary
export default function Dashboard() {
  return (
    <AuthErrorBoundary>
      <DashboardContent />
    </AuthErrorBoundary>
  )
}
