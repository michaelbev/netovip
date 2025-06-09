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
import { Plus, TrendingUp, Activity, Droplets, BarChart3, Download, Upload, Filter, Search } from "lucide-react"

export default function ProductionPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [wellFilter, setWellFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [productionData, setProductionData] = useState([
    {
      id: "1",
      well_name: "Eagle Ford #23",
      production_date: "2024-01-15",
      oil_volume: 45.5,
      gas_volume: 125.3,
      water_volume: 12.8,
      oil_price: 75.25,
      gas_price: 3.45,
      run_ticket: "RT-2024-001",
    },
    {
      id: "2",
      well_name: "Permian #18",
      production_date: "2024-01-15",
      oil_volume: 38.9,
      gas_volume: 98.4,
      water_volume: 15.2,
      oil_price: 75.25,
      gas_price: 3.45,
      run_ticket: "RT-2024-002",
    },
    {
      id: "3",
      well_name: "Bakken #31",
      production_date: "2024-01-15",
      oil_volume: 52.1,
      gas_volume: 142.7,
      water_volume: 18.5,
      oil_price: 74.8,
      gas_price: 3.42,
      run_ticket: "RT-2024-003",
    },
  ])

  const [newProduction, setNewProduction] = useState({
    well_id: "",
    production_date: "",
    oil_volume: "",
    gas_volume: "",
    water_volume: "",
    oil_price: "",
    gas_price: "",
    run_ticket: "",
  })

  const formatNumber = (num: number, decimals = 1) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const calculateRevenue = (oilVol: number, gasVol: number, oilPrice: number, gasPrice: number) => {
    return oilVol * oilPrice + gasVol * gasPrice
  }

  const totalOilProduction = productionData.reduce((sum, p) => sum + p.oil_volume, 0)
  const totalGasProduction = productionData.reduce((sum, p) => sum + p.gas_volume, 0)
  const totalWaterProduction = productionData.reduce((sum, p) => sum + p.water_volume, 0)
  const totalRevenue = productionData.reduce(
    (sum, p) => sum + calculateRevenue(p.oil_volume, p.gas_volume, p.oil_price, p.gas_price),
    0,
  )

  const handleAddProduction = async () => {
    try {
      const newEntry = {
        ...newProduction,
        id: Date.now().toString(),
        well_name: "Eagle Ford #23", // This would come from the selected well
      }

      setProductionData([...productionData, newEntry])

      toast({
        title: "Production data added",
        description: "Production entry has been recorded successfully",
      })

      setIsDialogOpen(false)
      setNewProduction({
        well_id: "",
        production_date: "",
        oil_volume: "",
        gas_volume: "",
        water_volume: "",
        oil_price: "",
        gas_price: "",
        run_ticket: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Production Management"
        description="Track daily production data and performance metrics"
        breadcrumbs={[{ title: "Operations", href: "/" }, { title: "Production" }]}
      >
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Production
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Production Data</DialogTitle>
              <DialogDescription>Record daily production volumes and pricing information</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="well">Well</Label>
                <Select
                  value={newProduction.well_id}
                  onValueChange={(value) => setNewProduction({ ...newProduction, well_id: value })}
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
                <Label htmlFor="production_date">Production Date</Label>
                <Input
                  id="production_date"
                  type="date"
                  value={newProduction.production_date}
                  onChange={(e) => setNewProduction({ ...newProduction, production_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oil_volume">Oil Volume (bbls)</Label>
                <Input
                  id="oil_volume"
                  type="number"
                  step="0.1"
                  placeholder="45.5"
                  value={newProduction.oil_volume}
                  onChange={(e) => setNewProduction({ ...newProduction, oil_volume: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gas_volume">Gas Volume (mcf)</Label>
                <Input
                  id="gas_volume"
                  type="number"
                  step="0.1"
                  placeholder="125.3"
                  value={newProduction.gas_volume}
                  onChange={(e) => setNewProduction({ ...newProduction, gas_volume: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water_volume">Water Volume (bbls)</Label>
                <Input
                  id="water_volume"
                  type="number"
                  step="0.1"
                  placeholder="12.8"
                  value={newProduction.water_volume}
                  onChange={(e) => setNewProduction({ ...newProduction, water_volume: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="run_ticket">Run Ticket #</Label>
                <Input
                  id="run_ticket"
                  placeholder="RT-2024-001"
                  value={newProduction.run_ticket}
                  onChange={(e) => setNewProduction({ ...newProduction, run_ticket: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oil_price">Oil Price ($/bbl)</Label>
                <Input
                  id="oil_price"
                  type="number"
                  step="0.01"
                  placeholder="75.25"
                  value={newProduction.oil_price}
                  onChange={(e) => setNewProduction({ ...newProduction, oil_price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gas_price">Gas Price ($/mcf)</Label>
                <Input
                  id="gas_price"
                  type="number"
                  step="0.01"
                  placeholder="3.45"
                  value={newProduction.gas_price}
                  onChange={(e) => setNewProduction({ ...newProduction, gas_price: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProduction}>Add Production</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oil Production</CardTitle>
              <Droplets className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{formatNumber(totalOilProduction)}</div>
              <p className="text-xs text-muted-foreground">bbls today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gas Production</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatNumber(totalGasProduction)}</div>
              <p className="text-xs text-muted-foreground">mcf today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Water Production</CardTitle>
              <Droplets className="h-4 w-4 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{formatNumber(totalWaterProduction)}</div>
              <p className="text-xs text-muted-foreground">bbls today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Today's value</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="daily" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="daily">Daily Production</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search production..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={wellFilter} onValueChange={setWellFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wells</SelectItem>
                  <SelectItem value="eagle-ford-23">Eagle Ford #23</SelectItem>
                  <SelectItem value="permian-18">Permian #18</SelectItem>
                  <SelectItem value="bakken-31">Bakken #31</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Production Records</CardTitle>
                <CardDescription>Track daily production volumes and pricing data</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Well</TableHead>
                      <TableHead>Oil (bbls)</TableHead>
                      <TableHead>Gas (mcf)</TableHead>
                      <TableHead>Water (bbls)</TableHead>
                      <TableHead>Oil Price</TableHead>
                      <TableHead>Gas Price</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Run Ticket</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productionData.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.production_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{entry.well_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-amber-600" />
                            {formatNumber(entry.oil_volume)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-blue-600" />
                            {formatNumber(entry.gas_volume)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-cyan-600" />
                            {formatNumber(entry.water_volume)}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(entry.oil_price)}</TableCell>
                        <TableCell>{formatCurrency(entry.gas_price)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(
                            calculateRevenue(entry.oil_volume, entry.gas_volume, entry.oil_price, entry.gas_price),
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.run_ticket}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Trends</CardTitle>
                <CardDescription>Historical production performance and forecasting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Production trend charts would be displayed here</p>
                    <p className="text-sm text-gray-400">Time series analysis and forecasting</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Well Performance</CardTitle>
                  <CardDescription>Production efficiency by well</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Eagle Ford #23", "Permian #18", "Bakken #31"].map((well, index) => (
                      <div key={well} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{well}</div>
                          <div className="text-sm text-muted-foreground">{[45.5, 38.9, 52.1][index]} bbl/day avg</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">{formatCurrency([3420, 2920, 3890][index])}</div>
                          <div className="text-sm text-muted-foreground">Daily revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Production Mix</CardTitle>
                  <CardDescription>Breakdown by product type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-amber-600" />
                        <span>Oil</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(totalOilProduction)} bbls</div>
                        <div className="text-sm text-muted-foreground">65% of revenue</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span>Gas</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(totalGasProduction)} mcf</div>
                        <div className="text-sm text-muted-foreground">35% of revenue</div>
                      </div>
                    </div>
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
