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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function WellsPage() {
  const { data: wells = [], loading, error } = useWells()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
    try {
      const response = await fetch("/api/wells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWell),
      })

      if (!response.ok) throw new Error("Failed to create well")

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
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge className="bg-yellow-500">Inactive</Badge>
      case "plugged":
        return <Badge className="bg-red-500">Plugged</Badge>
      case "drilling":
        return <Badge className="bg-blue-500">Drilling</Badge>
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
      <div className="flex flex-col">
        <PageHeader
          title="Wells Management"
          description="Manage your oil & gas wells and production assets"
          breadcrumbs={[{ title: "Operations", href: "/" }, { title: "Wells" }]}
        />
        <div className="flex-1 space-y-4 p-4">
          <div className="text-center py-12">
            <p>Loading wells data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <PageHeader
          title="Wells Management"
          description="Manage your oil & gas wells and production assets"
          breadcrumbs={[{ title: "Operations", href: "/" }, { title: "Wells" }]}
        />
        <div className="flex-1 space-y-4 p-4">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading wells data: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Well</DialogTitle>
              <DialogDescription>Create a new well record with location and operational details</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Well Name</Label>
                <Input
                  id="name"
                  placeholder="Eagle Ford #23"
                  value={newWell.name}
                  onChange={(e) => setNewWell({ ...newWell, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api">API Number</Label>
                <Input
                  id="api"
                  placeholder="42-123-45678"
                  value={newWell.api_number}
                  onChange={(e) => setNewWell({ ...newWell, api_number: e.target.value })}
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWell}>Create Well</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        <Tabs defaultValue="list" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wells..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="drilling">Drilling</SelectItem>
                  <SelectItem value="plugged">Plugged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wells ({filteredWells.length})</CardTitle>
                <CardDescription>Manage your well inventory and track operational status</CardDescription>
              </CardHeader>
              <CardContent>
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
                      <TableRow key={well.id}>
                        <TableCell className="font-medium">{well.name}</TableCell>
                        <TableCell className="font-mono text-sm">{well.api_number}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {well.county}, {well.state}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Well Locations</CardTitle>
                <CardDescription>Geographic view of your well assets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Interactive map would be displayed here</p>
                    <p className="text-sm text-gray-400">Integration with mapping service required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Wells</CardTitle>
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{safeWells.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {safeWells.filter((w) => w.status === "active").length} active
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
                  <p className="text-xs text-muted-foreground">bbl/day per well</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Depth</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156,420</div>
                  <p className="text-xs text-muted-foreground">feet drilled</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
