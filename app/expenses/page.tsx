"use client"

import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Calculator, FileText, TrendingDown } from "lucide-react"

export default function ExpensesPage() {
  const mockExpenses = [
    {
      id: 1,
      description: "Well Maintenance - Eagle Ford #23",
      amount: 15420,
      date: "2024-01-15",
      category: "Maintenance",
      status: "Paid",
    },
    {
      id: 2,
      description: "Equipment Rental - Permian #18",
      amount: 8200,
      date: "2024-01-14",
      category: "Equipment",
      status: "Pending",
    },
    {
      id: 3,
      description: "Transportation Costs",
      amount: 3850,
      date: "2024-01-13",
      category: "Transportation",
      status: "Paid",
    },
    { id: 4, description: "Regulatory Fees", amount: 2100, date: "2024-01-12", category: "Regulatory", status: "Paid" },
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
      <PageHeader title="Expenses" description="Track and manage operational expenses">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(29570)}</div>
              <p className="text-xs text-gray-600">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Calculator className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(8200)}</div>
              <p className="text-xs text-gray-600">1 pending expense</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-gray-600">Active categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Track all operational expenses and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="text-red-600">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>
                      <Badge variant={expense.status === "Paid" ? "default" : "secondary"}>{expense.status}</Badge>
                    </TableCell>
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
