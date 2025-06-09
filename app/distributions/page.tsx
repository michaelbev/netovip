"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, PieChart, Users, DollarSign, Calendar } from "lucide-react"

export default function DistributionsPage() {
  const mockDistributions = [
    { id: 1, period: "December 2023", totalAmount: 125000, owners: 45, status: "Completed", date: "2024-01-15" },
    { id: 2, period: "November 2023", totalAmount: 118500, owners: 45, status: "Completed", date: "2023-12-15" },
    { id: 3, period: "October 2023", totalAmount: 132000, owners: 44, status: "Completed", date: "2023-11-15" },
    { id: 4, period: "January 2024", totalAmount: 145000, owners: 46, status: "Pending", date: "2024-02-15" },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="flex flex-col">
      <PageHeader title="Distributions" description="Manage revenue distributions to owners">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Distribution
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(520500)}</div>
              <p className="text-xs text-gray-600">Last 4 months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Owners</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">46</div>
              <p className="text-xs text-gray-600">Receiving distributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(145000)}</div>
              <p className="text-xs text-gray-600">January 2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Distribution</CardTitle>
              <PieChart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(130125)}</div>
              <p className="text-xs text-gray-600">Per month</p>
            </CardContent>
          </Card>
        </div>

        {/* Distributions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution History</CardTitle>
            <CardDescription>Track all revenue distributions to owners</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Number of Owners</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Distribution Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDistributions.map((distribution) => (
                  <TableRow key={distribution.id}>
                    <TableCell className="font-medium">{distribution.period}</TableCell>
                    <TableCell className="text-green-600">{formatCurrency(distribution.totalAmount)}</TableCell>
                    <TableCell>{distribution.owners}</TableCell>
                    <TableCell>
                      <Badge variant={distribution.status === "Completed" ? "default" : "secondary"}>
                        {distribution.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{distribution.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
