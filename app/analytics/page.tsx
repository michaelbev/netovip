"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context-mock"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format, subDays } from "date-fns"
import {
  Loader2,
  Download,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Droplets,
  DollarSign,
  AlertTriangle,
} from "lucide-react"

// Mock data for charts - in a real app, this would come from your API
const mockProductionData = [
  { month: "Jan", oil: 12500, gas: 8500, water: 3200 },
  { month: "Feb", oil: 13200, gas: 9100, water: 3500 },
  { month: "Mar", oil: 14100, gas: 9800, water: 3800 },
  { month: "Apr", oil: 13800, gas: 9500, water: 3700 },
  { month: "May", oil: 14500, gas: 10200, water: 4000 },
  { month: "Jun", oil: 15200, gas: 10800, water: 4200 },
]

const mockRevenueData = [
  { month: "Jan", revenue: 1250000, expenses: 450000, profit: 800000 },
  { month: "Feb", revenue: 1320000, expenses: 470000, profit: 850000 },
  { month: "Mar", revenue: 1410000, expenses: 510000, profit: 900000 },
  { month: "Apr", revenue: 1380000, expenses: 490000, profit: 890000 },
  { month: "May", revenue: 1450000, expenses: 520000, profit: 930000 },
  { month: "Jun", revenue: 1520000, expenses: 540000, profit: 980000 },
]

const mockWellPerformance = [
  { name: "Eagle Ford #23", production: 1250, revenue: 895000, efficiency: 94 },
  { name: "Permian #18", production: 1180, revenue: 823000, efficiency: 91 },
  { name: "Bakken #31", production: 1050, revenue: 735000, efficiency: 88 },
  { name: "Permian #25", production: 980, revenue: 686000, efficiency: 85 },
  { name: "Eagle Ford #27", production: 920, revenue: 644000, efficiency: 82 },
]

const mockOwnershipData = [
  { type: "Working Interest", percentage: 65 },
  { type: "Royalty Interest", percentage: 25 },
  { type: "Overriding Royalty", percentage: 10 },
]

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [selectedWell, setSelectedWell] = useState<string>("all")

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Calculate summary metrics
  const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalProfit = mockRevenueData.reduce((sum, item) => sum + item.profit, 0)
  const totalOilProduction = mockProductionData.reduce((sum, item) => sum + item.oil, 0)
  const totalGasProduction = mockProductionData.reduce((sum, item) => sum + item.gas, 0)
  const averageEfficiency = Math.round(
    mockWellPerformance.reduce((sum, well) => sum + well.efficiency, 0) / mockWellPerformance.length,
  )

  // Simulate data loading
  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [authLoading])

  // Redirect if not authenticated (in real app - for demo, this is always true)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Analytics Dashboard" description="Comprehensive insights into your oil & gas operations">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Demo Mode Indicator */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> Displaying sample analytics data for demonstration purposes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Analytics Filters</CardTitle>
            <CardDescription>Customize your view with these filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <Select defaultValue="6months">
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Well Selection</label>
                <Select value={selectedWell} onValueChange={setSelectedWell}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a well" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wells</SelectItem>
                    <SelectItem value="eagle-ford-23">Eagle Ford #23</SelectItem>
                    <SelectItem value="permian-18">Permian #18</SelectItem>
                    <SelectItem value="bakken-31">Bakken #31</SelectItem>
                    <SelectItem value="permian-25">Permian #25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-gray-500">Last 6 months</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalProfit)}</p>
                  <p className="text-xs text-gray-500">Last 6 months</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Oil Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-600">{totalOilProduction.toLocaleString()} bbl</p>
                  <p className="text-xs text-gray-500">Last 6 months</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-teal-600">{averageEfficiency}%</p>
                  <p className="text-xs text-gray-500">Across all wells</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="production" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="wells">Well Performance</TabsTrigger>
            <TabsTrigger value="ownership">Ownership</TabsTrigger>
          </TabsList>

          {/* Production Tab */}
          <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Trends</CardTitle>
                <CardDescription>Monthly oil, gas, and water production volumes</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Production Chart Visualization</p>
                    <p className="text-sm text-gray-400">Total Oil: {totalOilProduction.toLocaleString()} bbl</p>
                    <p className="text-sm text-gray-400">Total Gas: {totalGasProduction.toLocaleString()} mcf</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-sm">Oil</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Gas</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                    <span className="text-sm">Water</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Production by Well</CardTitle>
                  <CardDescription>Top producing wells by volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockWellPerformance.map((well, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-full bg-teal-500 mr-3"></div>
                          <div>
                            <p className="font-medium">{well.name}</p>
                            <p className="text-sm text-gray-500">{well.production} bbl/day</p>
                          </div>
                        </div>
                        <Badge variant={index < 2 ? "default" : "secondary"}>
                          {index < 2 ? "High Performer" : "Average"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Production Forecast</CardTitle>
                  <CardDescription>Projected production for next 3 months</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Forecast Chart Visualization</p>
                      <p className="text-sm text-gray-400">Projected Increase: +5.2%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Financial Chart Visualization</p>
                    <p className="text-sm text-gray-400">Total Revenue: {formatCurrency(totalRevenue)}</p>
                    <p className="text-sm text-gray-400">Total Profit: {formatCurrency(totalProfit)}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Revenue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Expenses</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Profit</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Well</CardTitle>
                  <CardDescription>Top revenue generating wells</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockWellPerformance.map((well, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-full bg-green-500 mr-3"></div>
                          <div>
                            <p className="font-medium">{well.name}</p>
                            <p className="text-sm text-gray-500">{formatCurrency(well.revenue)}</p>
                          </div>
                        </div>
                        <p className="font-medium text-green-600">
                          {formatCurrency(well.revenue / 6)} <span className="text-xs text-gray-500">/mo</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>Major expense categories</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Expense Breakdown Chart</p>
                      <div className="flex justify-center gap-4 mt-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-xs">Operations</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                          <span className="text-xs">Maintenance</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-xs">Admin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Well Performance Tab */}
          <TabsContent value="wells" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Well Efficiency Comparison</CardTitle>
                <CardDescription>Performance metrics across all wells</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Well Efficiency Chart</p>
                    <p className="text-sm text-gray-400">Average Efficiency: {averageEfficiency}%</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockWellPerformance.slice(0, 3).map((well, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{well.name}</CardTitle>
                    <CardDescription>
                      Efficiency: <span className="font-medium">{well.efficiency}%</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Production</span>
                          <span>{well.production} bbl/day</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(well.production / 1250) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Revenue</span>
                          <span>{formatCurrency(well.revenue)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(well.revenue / 895000) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Efficiency</span>
                          <span>{well.efficiency}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${well.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ownership Tab */}
          <TabsContent value="ownership" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ownership Distribution</CardTitle>
                <CardDescription>Breakdown of interest types across all properties</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Ownership Distribution Chart</p>
                    <div className="flex justify-center gap-4 mt-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-teal-500 mr-2"></div>
                        <span className="text-xs">Working Interest (65%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                        <span className="text-xs">Royalty Interest (25%)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        <span className="text-xs">Overriding Royalty (10%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              </CardFooter>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Owner Distribution</CardTitle>
                  <CardDescription>Revenue distribution by owner type</CardDescription>
                </CardHeader>
                <CardContent className="h-64">
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Owner Distribution Chart</p>
                      <p className="text-sm text-gray-400">Total Owners: 156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribution History</CardTitle>
                  <CardDescription>Monthly payment distributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => {
                      const date = subDays(new Date(), index * 30)
                      const amount = 450000 - index * 15000
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{format(date, "MMMM yyyy")}</p>
                            <p className="text-sm text-gray-500">156 owners</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">{formatCurrency(amount)}</p>
                            <p className="text-xs text-gray-500">{format(date, "MMM d, yyyy")}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alerts and Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Insights</CardTitle>
            <CardDescription>Automated insights based on your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                <div className="mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-green-800">Production Increase Detected</h4>
                  <p className="text-sm text-green-700">
                    Eagle Ford #23 has shown a 12% increase in production over the last 30 days. Consider reviewing
                    operational changes for potential application to other wells.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <div className="mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-amber-800">Expense Anomaly</h4>
                  <p className="text-sm text-amber-700">
                    Maintenance expenses for Permian #18 are 15% higher than the average. Consider investigating the
                    cause of increased maintenance costs.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
