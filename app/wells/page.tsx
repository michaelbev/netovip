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
import { useWells } from "@/hooks/use-supabase-data"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Droplets,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function WellsPage() {
  const { data: wells = [], loading, error } = useWells()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newWell, setNewWell] = useState({
    name: "",
    api_number: "",
    location: "",
    county: "",
    state: "TX",
    status: "active",
    well_type: "oil",
    spud_date: "",
    completion_date: "",
    total_depth: "",
  })

  // Safe filtering with fallback to empty array
  const safeWells = Array.isArray(wells) ? wells : []
  const filteredWells = safeWells.filter((well) => {
    const matchesSearch =
      well.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      well.api_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || well.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateWell = async () => {
    if (!newWell.name || !newWell.api_number) {
      toast({
        title: "Validation Error",
        description: "Well name and API number are required",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/wells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWell),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create well")
      }

      toast({
        title: "Well created",
        description: `${newWell.name} has been added successfully`,
      })

      setIsDialogOpen(false)
      setNewWell({
        name: "",
        api_number: "",
        location: "",
        county: "",
        state: "TX",
        status: "active",
        well_type: "oil",
        spud_date: "",
        completion_date: "",
        total_depth: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "inactive":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Inactive</Badge>
      case "plugged":
        return <Badge className="bg-red-500 hover:bg-red-600">Plugged</Badge>
      case "drilling":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Drilling</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getWellTypeIcon = (type: string) => {
    switch (type) {
      case "oil":
        return <Droplets className="h-4 w-4 text-amber-600" />
      case "gas":
        return <Activity className="h-4 w-4 text-blue-600" />
      case "injection":
        return <TrendingDown className="h-4 w-4 text-purple-600" />
      case "water":
        return <Droplets className="h-4 w-4 text-cyan-600" />
      default:
        return <Droplets className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader
          title="Wells Management"
          description="Manage your oil & gas wells and production assets"
          breadcrumbs={[{ title: "Operations", href: "/" }, { title: "Wells" }]}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="text-muted-foreground">Loading wells data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader
          title="Wells Management"
          description="Manage your oil & gas wells and production assets"
          breadcrumbs={[{ title: "Operations", href: "/" }, { title: "Wells" }]}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Activity className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">Error Loading Wells</h3>
              <p className="text-muted-foreground mt-2">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="Wells Management"
        description="Manage your oil & gas wells and production assets"
        breadcrumbs={[{ title: "Operations", href: "/" }, { title: "Wells" }]}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Well
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Well</DialogTitle>
              <DialogDescription>Create a new well record with location and operational details</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Well Name *</Label>
                <Input
                  id="name"
                  placeholder="Eagle Ford #23"
                  value={newWell.name}
                  onChange={(e) => setNewWell({ ...newWell, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api">API Number *</Label>
                <Input
                  id="api"
                  placeholder="42-123-45678"
                  value={newWell.api_number}
                  onChange={(e) => setNewWell({ ...newWell, api_number: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Section 12, T5S R8E"
                  value={newWell.location}
                  onChange={(e) => setNewWell({ ...newWell, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  placeholder="Karnes"
                  value={newWell.county}
                  onChange={(e) => setNewWell({ ...newWell, county: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={newWell.state} onValueChange={(value) => setNewWell({ ...newWell, state: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Well Type</Label>
                <Select
                  value={newWell.well_type}
                  onValueChange={(value) => setNewWell({ ...newWell, well_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oil">Oil</SelectItem>
                    <SelectItem value="gas">Gas</SelectItem>
                    <SelectItem value="injection">Injection</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newWell.status} onValueChange={(value) => setNewWell({ ...newWell, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="drilling">Drilling</SelectItem>
                    <SelectItem value="plugged">Plugged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spud_date">Spud Date</Label>
                <Input
                  id="spud_date"
                  type="date"
                  value={newWell.spud_date}
                  onChange={(e) => setNewWell({ ...newWell, spud_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completion_date">Completion Date</Label>
                <Input
                  id="completion_date"
                  type="date"
                  value={newWell.completion_date}
                  onChange={(e) => setNewWell({ ...newWell, completion_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_depth">Total Depth (ft)</Label>
                <Input
                  id="total_depth"
                  type="number"
                  placeholder="8500"
                  value={newWell.total_depth}
                  onChange={(e) => setNewWell({ ...newWell, total_depth: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleCreateWell} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Well"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex-1 space-y-6 p-6">
        <Tabs defaultValue="list" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wells..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="drilling">Drilling</SelectItem>
                  <SelectItem value="plugged">Plugged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-teal-600" />
                  Wells ({filteredWells.length})
                </CardTitle>
                <CardDescription>Manage your well inventory and track operational status</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredWells.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Droplets className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wells Found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "No wells match your current filters."
                        : "Get started by adding your first well."}
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Well
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Well Name</TableHead>
                          <TableHead>API Number</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Production</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWells.map((well) => (
                          <TableRow key={well.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{well.name}</TableCell>
                            <TableCell className="font-mono text-sm">{well.api_number}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {well.county && well.state ? `${well.county}, ${well.state}` : well.location || "N/A"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getWellTypeIcon(well.well_type)}
                                <span className="capitalize">{well.well_type}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(well.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-600" />
                                <span className="text-sm">45.2 bbl/day</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Well
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Production Data
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  Well Locations
                </CardTitle>
                <CardDescription>Geographic view of your well assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="h-8 w-8 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Interactive Map Coming Soon</h3>
                      <p className="text-gray-500 mt-2">Geographic visualization of your well locations</p>
                      <p className="text-sm text-gray-400 mt-1">Integration with mapping service in development</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Wells</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeWells.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {safeWells.filter((w) => w.status === "active").length} active wells
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Production</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42.3</div>
                  <p className="text-xs text-muted-foreground">barrels per day per well</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Depth</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156,420</div>
                  <p className="text-xs text-muted-foreground">feet drilled total</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Well Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["active", "inactive", "drilling", "plugged"].map((status) => {
                      const count = safeWells.filter((w) => w.status === status).length
                      const percentage = safeWells.length > 0 ? (count / safeWells.length) * 100 : 0
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                            <span className="text-sm capitalize">{status}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Well Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["oil", "gas", "injection", "water"].map((type) => {
                      const count = safeWells.filter((w) => w.well_type === type).length
                      const percentage = safeWells.length > 0 ? (count / safeWells.length) * 100 : 0
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getWellTypeIcon(type)}
                            <span className="text-sm capitalize">{type}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
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
      </div>
    </div>
  )
}
