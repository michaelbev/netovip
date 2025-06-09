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
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Users,
  Building2,
  User,
  Crown,
  Shield,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  MoreHorizontal,
  Edit,
  Eye,
  FileText,
  DollarSign,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function OwnersPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [owners, setOwners] = useState([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "555-0101",
      address: "123 Main St",
      city: "Houston",
      state: "TX",
      zip_code: "77001",
      owner_type: "individual",
      tax_id: "123-45-6789",
      total_ownership: 25.5,
      wells_count: 3,
      monthly_revenue: 15420,
    },
    {
      id: "2",
      name: "ABC Minerals Corp",
      email: "contact@abcminerals.com",
      phone: "555-0102",
      address: "456 Corporate Blvd",
      city: "Dallas",
      state: "TX",
      zip_code: "75201",
      owner_type: "corporation",
      tax_id: "12-3456789",
      total_ownership: 45.0,
      wells_count: 5,
      monthly_revenue: 28750,
    },
    {
      id: "3",
      name: "Smith Family Trust",
      email: "trustee@smithfamily.com",
      phone: "555-0103",
      address: "789 Trust Ave",
      city: "Austin",
      state: "TX",
      zip_code: "78701",
      owner_type: "trust",
      tax_id: "98-7654321",
      total_ownership: 15.0,
      wells_count: 2,
      monthly_revenue: 12300,
    },
  ])

  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "TX",
    zip_code: "",
    owner_type: "individual",
    tax_id: "",
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getOwnerTypeIcon = (type: string) => {
    switch (type) {
      case "individual":
        return <User className="h-4 w-4 text-blue-600" />
      case "corporation":
        return <Building2 className="h-4 w-4 text-purple-600" />
      case "partnership":
        return <Users className="h-4 w-4 text-green-600" />
      case "trust":
        return <Shield className="h-4 w-4 text-orange-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getOwnerTypeBadge = (type: string) => {
    const colors = {
      individual: "bg-blue-500",
      corporation: "bg-purple-500",
      partnership: "bg-green-500",
      trust: "bg-orange-500",
    }
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-500"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const filteredOwners = owners.filter((owner) => {
    const matchesSearch =
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || owner.owner_type === typeFilter
    return matchesSearch && matchesType
  })

  const handleCreateOwner = async () => {
    try {
      // In a real app, this would make an API call
      const newOwnerData = {
        ...newOwner,
        id: Date.now().toString(),
        total_ownership: 0,
        wells_count: 0,
        monthly_revenue: 0,
      }

      setOwners([...owners, newOwnerData])

      toast({
        title: "Owner created",
        description: `${newOwner.name} has been added successfully`,
      })

      setIsDialogOpen(false)
      setNewOwner({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "TX",
        zip_code: "",
        owner_type: "individual",
        tax_id: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const totalOwners = owners.length
  const totalRevenue = owners.reduce((sum, owner) => sum + owner.monthly_revenue, 0)
  const avgOwnership = owners.reduce((sum, owner) => sum + owner.total_ownership, 0) / owners.length

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Owners Management"
        description="Manage mineral rights owners and stakeholders"
        breadcrumbs={[{ title: "Operations", href: "/" }, { title: "Owners" }]}
      >
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Export List
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Owner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Owner</DialogTitle>
              <DialogDescription>Create a new owner record for mineral rights tracking</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name / Company</Label>
                <Input
                  id="name"
                  placeholder="John Smith or ABC Corp"
                  value={newOwner.name}
                  onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner_type">Owner Type</Label>
                <Select
                  value={newOwner.owner_type}
                  onValueChange={(value) => setNewOwner({ ...newOwner, owner_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="owner@example.com"
                  value={newOwner.email}
                  onChange={(e) => setNewOwner({ ...newOwner, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="555-0123"
                  value={newOwner.phone}
                  onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={newOwner.address}
                  onChange={(e) => setNewOwner({ ...newOwner, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Houston"
                  value={newOwner.city}
                  onChange={(e) => setNewOwner({ ...newOwner, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={newOwner.state} onValueChange={(value) => setNewOwner({ ...newOwner, state: value })}>
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
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  placeholder="77001"
                  value={newOwner.zip_code}
                  onChange={(e) => setNewOwner({ ...newOwner, zip_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_id">Tax ID</Label>
                <Input
                  id="tax_id"
                  placeholder="123-45-6789 or 12-3456789"
                  value={newOwner.tax_id}
                  onChange={(e) => setNewOwner({ ...newOwner, tax_id: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOwner}>Create Owner</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Owners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOwners}</div>
              <p className="text-xs text-muted-foreground">Active stakeholders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Total distributions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Ownership</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgOwnership.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Per owner</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Corporations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{owners.filter((o) => o.owner_type === "corporation").length}</div>
              <p className="text-xs text-muted-foreground">Business entities</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list">Owners List</TabsTrigger>
              <TabsTrigger value="ownership">Ownership Map</TabsTrigger>
              <TabsTrigger value="distributions">Distributions</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="trust">Trust</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Owners ({filteredOwners.length})</CardTitle>
                <CardDescription>Manage mineral rights owners and their contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Ownership</TableHead>
                      <TableHead>Monthly Revenue</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOwners.map((owner) => (
                      <TableRow key={owner.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                              <AvatarFallback>
                                {owner.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{owner.name}</div>
                              <div className="text-sm text-muted-foreground">{owner.wells_count} wells</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getOwnerTypeIcon(owner.owner_type)}
                            {getOwnerTypeBadge(owner.owner_type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {owner.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {owner.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {owner.city}, {owner.state}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="font-medium">{owner.total_ownership}%</div>
                            <div className="text-sm text-muted-foreground">Total interest</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right font-medium text-green-600">
                            {formatCurrency(owner.monthly_revenue)}
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
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Owner
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Ownership Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Payment History
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

          <TabsContent value="ownership" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ownership Distribution</CardTitle>
                <CardDescription>Visual representation of ownership interests by well</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Crown className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Ownership visualization charts would be displayed here</p>
                    <p className="text-sm text-gray-400">Interactive ownership mapping by well and interest type</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distributions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution Summary</CardTitle>
                <CardDescription>Revenue distribution calculations and payment tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {owners.map((owner) => (
                    <div key={owner.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {owner.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{owner.name}</div>
                          <div className="text-sm text-muted-foreground">{owner.total_ownership}% ownership</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">{formatCurrency(owner.monthly_revenue)}</div>
                        <div className="text-sm text-muted-foreground">This month</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
