"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Calculator, FileText, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Expense {
  id: string
  description: string
  amount: number
  expense_date: string
  category: string
  status: string
  wells?: { name: string } | null
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demoMessage, setDemoMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/expenses")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch expenses")
      }

      // Ensure expenses is always an array
      const expensesData = Array.isArray(data.expenses) ? data.expenses : []
      setExpenses(expensesData)

      // Set demo message if provided
      if (data.message) {
        setDemoMessage(data.message)
      }
    } catch (err: any) {
      console.error("Error fetching expenses:", err)
      setError(err.message)
      // Set empty array on error
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  // Safe calculations with fallbacks
  const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0) : 0
  const pendingExpenses = Array.isArray(expenses) ? expenses.filter((e) => e?.status === "pending") : []
  const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + (expense?.amount || 0), 0)
  const categories = Array.isArray(expenses) ? [...new Set(expenses.map((e) => e?.category).filter(Boolean))].length : 0

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

  return (
    <div className="flex flex-col">
      <PageHeader title="Expenses" description="Track and manage operational expenses">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-4 p-4">
        {/* Demo Mode Alert */}
        {demoMessage && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{demoMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading expenses: {error}
              <Button variant="outline" size="sm" className="ml-2" onClick={fetchExpenses}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
            {!Array.isArray(expenses) || expenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{error ? "Unable to load expenses" : "No expenses found"}</p>
                <Button className="mt-4" onClick={fetchExpenses}>
                  <Plus className="w-4 h-4 mr-2" />
                  {error ? "Retry Loading" : "Add First Expense"}
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
                    <TableRow key={expense?.id || Math.random()}>
                      <TableCell className="font-medium">
                        {expense?.description || "Unknown Expense"}
                        {expense?.wells?.name && (
                          <div className="text-sm text-gray-500">Well: {expense.wells.name}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense?.category || "Uncategorized"}</Badge>
                      </TableCell>
                      <TableCell className="text-red-600">{formatCurrency(expense?.amount || 0)}</TableCell>
                      <TableCell>{formatDate(expense?.expense_date || "")}</TableCell>
                      <TableCell>
                        <Badge variant={expense?.status === "paid" ? "default" : "secondary"}>
                          {expense?.status || "unknown"}
                        </Badge>
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
