"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PageHeader } from "@/components/page-header"
import { useDashboardStats } from "@/hooks/use-supabase-data"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  Users,
  FileText,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function Dashboard() {
  const { stats, loading } = useDashboardStats()

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

  return (
    <div className="flex flex-col">
      <PageHeader title="Dashboard" description="Oil & Gas Operations Overview">
        <Button asChild>
          <Link href="/revenue">
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/reports">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wells">Wells</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
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
                        Add Revenue
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/expenses">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Expense
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Generate comprehensive reports for compliance and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Reporting Suite</h3>
                  <p className="text-gray-600 mb-4">Financial reports, compliance documents, and analytics</p>
                  <Button asChild>
                    <Link href="/reports">
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
