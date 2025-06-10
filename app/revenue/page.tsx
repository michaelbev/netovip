"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { useRevenue } from "@/hooks/use-supabase-data"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function RevenuePage() {
  const { data: revenue = [], loading, error } = useRevenue()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRevenue, setNewRevenue] = useState({
    well_id: "",
    amount: "",
    gross_amount: "",
    production_month: "",
    revenue_type: "oil",
    product_volume: "",
    product_price: "",
    description: "",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "distributed":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Distributed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-red-500">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getRevenueTypeColor = (type: string) => {
    switch (type) {
      case "oil":
        return "text-amber-600"
      case "gas":
        return "text-blue-600"
      case "ngl":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  // Safe calculations with fallback to empty array
  const safeRevenue = Array.isArray(revenue) ? revenue : []
  const totalRevenue = safeRevenue.reduce((sum, r) => sum + (r.amount || 0), 0)
  const monthlyRevenue = safeRevenue
    .filter((r) => new Date(r.production_month).getMonth() === new Date().getMonth())
    .reduce((sum, r) => sum + (r.amount || 0), 0)

  if (loading) {
    return (
      <div className="flex flex-col">
        <PageHeader
          title="Revenue Management"
          description="Track and manage oil & gas revenue streams"
          breadcrumbs={[{ title: "Financial", href: "/" }, { title: "Revenue" }]}
        />
        <div className="flex-1 space-y-4 p-4">
          <div className="text-center py-12">
            <p>Loading revenue data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <PageHeader
          title="Revenue Management"
          description="Track and manage oil & gas revenue streams"
          breadcrumbs={[{ title: "Financial", href: "/" }, { title: "Revenue" }]}
        />
        <div className="flex-1 space-y-4 p-4">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading revenue data: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Revenue Management"
        description="Track and manage oil & gas revenue streams"
        breadcrumbs={[{ title: "Financial", href: "/" }, { title: "Revenue" }]}
      >
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Revenue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Revenue Entry</DialogTitle>
              <DialogDescription>Record new revenue from oil & gas production</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="well">Well</Label>
                <Select
                  value={newRevenue.well_id}
                  onValueChange={(value) => setNewRevenue({ ...newRevenue, well_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select well" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="well1">Eagle Ford #23</SelectItem>
                    <SelectItem value="well2">Permian #18</SelectItem>
                    <SelectItem value="well3">Bakken #31</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue_type">Revenue Type</Label>
                <Select
                  value={newRevenue.revenue_type}
                  onValueChange={(value) => setNewRevenue({ ...newRevenue, revenue_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oil">Oil</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                    <SelectItem value="ngl">NGL</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="production_month">Production Month</Label>
                <Input
                  id="production_month"
                  type="month"
                  value={newRevenue.production_month}
                  onChange={(e) => setNewRevenue({ ...newRevenue, production_month: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_volume">Volume</Label>
                <Input
                  id="product_volume"
                  type="number"
                  placeholder="1250.5"
                  value={newRevenue.product_volume}
                  onChange={(e) => setNewRevenue({ ...newRevenue, product_volume: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_price">Price per Unit</Label>
                <Input
                  id="product_price"
                  type="number"
                  step="0.01"
                  placeholder="75.25"
                  value={newRevenue.product_price}
                  onChange={(e) => setNewRevenue({ ...newRevenue, product_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gross_amount">Gross Amount</Label>
                <Input
                  id="gross_amount"
                  type="number"
                  step="0.01"
                  placeholder="94125.00"
                  value={newRevenue.gross_amount}
                  onChange={(e) => setNewRevenue({ ...newRevenue, gross_amount: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="January 2024 oil production"
                  value={newRevenue.description}
                  onChange={(e) => setNewRevenue({ ...newRevenue, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button>Add Revenue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">Current month revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeRevenue.filter((r) => r.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Well</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue / Math.max(safeRevenue.length, 1))}</div>
              <p className="text-xs text-muted-foreground">Average revenue</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="entries" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="entries">Revenue Entries</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="distributions">Distributions</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search revenue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="entries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Entries</CardTitle>
                <CardDescription>Track all revenue from oil & gas production</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Production Month</TableHead>
                      <TableHead>Well</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeRevenue.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.production_month).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">Eagle Ford #23</TableCell>
                        <TableCell>
                          <span className={`capitalize ${getRevenueTypeColor(entry.revenue_type)}`}>
                            {entry.revenue_type}
                          </span>
                        </TableCell>
                        <TableCell>1,250.5 bbl</TableCell>
                        <TableCell>$75.25</TableCell>
                        <TableCell className="font-medium text-green-600">{formatCurrency(entry.amount)}</TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Edit Entry</DropdownMenuItem>
                              <DropdownMenuItem>Calculate Distribution</DropdownMenuItem>
                              <DropdownMenuItem>Generate Report</DropdownMenuItem>
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

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Performance insights and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Revenue analytics charts would be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distributions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Distributions</CardTitle>
                <CardDescription>Owner distribution calculations and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Distribution management interface</p>
                  <Button className="mt-4">Calculate Distributions</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
