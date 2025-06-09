"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Calculator, FileText, TrendingDown, Loader2 } from "lucide-react"

interface Expense {
  id: string
  description: string
  amount: number
  expense_date: string
  category: string
  status: string
  wells?: { name: string }
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/expenses")

      if (!response.ok) {
        throw new Error("Failed to fetch expenses")
      }

      const data = await response.json()
      setExpenses(data.expenses || [])
    } catch (err: any) {
      console.error("Error fetching expenses:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingExpenses = expenses.filter((e) => e.status === "pending")
  const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const categories = [...new Set(expenses.map((e) => e.category))].length

  if (loading) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Expenses" description="Track and manage operational expenses">
          <Button disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <PageHeader title="Expenses" description="Track and manage operational expenses">
          <Button onClick={fetchExpenses}>
            <Plus className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </PageHeader>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading expenses: {error}</p>
            <Button onClick={fetchExpenses}>Try Again</Button>
          </div>
        </div>
      </div>
    )
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
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-gray-600">{expenses.length} total expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Calculator className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-gray-600">{pendingExpenses.length} pending expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories}</div>
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
            {expenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No expenses found</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Expense
                </Button>
              </div>
            ) : (
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
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {expense.description}
                        {expense.wells && <div className="text-sm text-gray-500">Well: {expense.wells.name}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="text-red-600">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{formatDate(expense.expense_date)}</TableCell>
                      <TableCell>
                        <Badge variant={expense.status === "paid" ? "default" : "secondary"}>{expense.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
