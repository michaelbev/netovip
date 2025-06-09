"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AuthDebugPage() {
  const router = useRouter()
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check auth status via API
        const response = await fetch("/api/auth/check")
        const data = await response.json()
        setAuthStatus(data)
      } catch (error) {
        console.error("Auth check failed:", error)
        setAuthStatus({ error: error.message })
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const handleCreateCompany = async () => {
    if (!authStatus?.user) return

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Oil & Gas Company",
          email: authStatus.user.email,
          userId: authStatus.user.id,
          userName: authStatus.user.user_metadata?.full_name || authStatus.user.email,
        }),
      })

      if (response.ok) {
        alert("Company created! Redirecting to dashboard...")
        router.push("/")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert(`Error: ${error}`)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return <div className="p-4">Loading auth status...</div>
  }

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Auth Status:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(authStatus, null, 2)}</pre>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => router.push("/")}>Go to Dashboard</Button>

            {authStatus?.needsSetup && (
              <Button onClick={handleCreateCompany} variant="outline">
                Create Company
              </Button>
            )}

            <Button onClick={() => router.push("/setup")} variant="outline">
              Go to Setup
            </Button>

            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>

          {authStatus?.needsSetup && (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
              <p className="font-medium">Setup Required</p>
              <p>Your user account exists but you need to create or join a company.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
