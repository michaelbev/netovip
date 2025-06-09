"use client"

import { useAuth } from "@/contexts/auth-context"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, BarChart3, Droplets, Users, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { user, session, loading: authLoading, signOut } = useAuth()
  const { wells, revenue, owners, production, loading: dataLoading, error, refetch } = useSupabaseData()
  const router = useRouter()

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!session || !user) {
    router.push("/login")
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Oil & Gas Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}</p>
        </div>
        <Button onClick={handleSignOut} variant="outline">
          Sign Out
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <Button onClick={refetch} variant="outline" size="sm" className="ml-auto">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {dataLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Dashboard Stats */}
      {!dataLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wells</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wells.length}</div>
              <p className="text-xs text-muted-foreground">Active wells in portfolio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Records</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenue.length}</div>
              <p className="text-xs text-muted-foreground">Revenue entries this period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Owners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{owners.length}</div>
              <p className="text-xs text-muted-foreground">Registered owners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Production</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{production.length}</div>
              <p className="text-xs text-muted-foreground">Production records</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Data */}
      {!dataLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Wells</CardTitle>
              <CardDescription>Latest wells in your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              {wells.length > 0 ? (
                <div className="space-y-2">
                  {wells.slice(0, 5).map((well) => (
                    <div key={well.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{well.name}</p>
                        <p className="text-sm text-muted-foreground">{well.api_number}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{well.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No wells found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Revenue</CardTitle>
              <CardDescription>Latest revenue entries</CardDescription>
            </CardHeader>
            <CardContent>
              {revenue.length > 0 ? (
                <div className="space-y-2">
                  {revenue.slice(0, 5).map((rev) => (
                    <div key={rev.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">${rev.gross_revenue?.toLocaleString() || "0"}</p>
                        <p className="text-sm text-muted-foreground">{rev.production_month}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{rev.product_type}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No revenue records found</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
