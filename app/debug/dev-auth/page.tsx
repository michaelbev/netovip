"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DevAuthDebug() {
  const { user, session, loading, signOut } = useAuth()
  const { toast } = useToast()
  const [authCheckResult, setAuthCheckResult] = useState<any>(null)
  const [cookies, setCookies] = useState<string>("")
  const [refreshing, setRefreshing] = useState(false)
  const [settingUp, setSettingUp] = useState(false)

  useEffect(() => {
    // Get cookies
    setCookies(document.cookie)

    // Check auth status
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/check")
      const result = await response.json()
      setAuthCheckResult(result)
    } catch (error) {
      console.error("Auth check failed:", error)
    }
  }

  const handleQuickSetup = async () => {
    setSettingUp(true)
    try {
      const response = await fetch("/api/auth/quick-setup", {
        method: "POST",
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: "Setup Complete!",
          description: result.message,
        })
        // Refresh auth status
        await checkAuthStatus()
      } else {
        toast({
          title: "Setup Failed",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Setup Error",
        description: "Failed to complete setup",
        variant: "destructive",
      })
    } finally {
      setSettingUp(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await checkAuthStatus()
    setCookies(document.cookie)
    setRefreshing(false)
  }

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "testpassword123",
      })

      if (error) {
        console.error("Test login error:", error)
        alert(`Login failed: ${error.message}`)
      } else {
        console.log("Test login successful:", data)
        alert("Login successful!")
      }
    } catch (error) {
      console.error("Test login exception:", error)
      alert("Login failed with exception")
    }
  }

  const environment = process.env.NODE_ENV || "unknown"
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Development Auth Debug</h1>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment */}
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Current environment configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Environment:</span>
              <Badge variant="outline">{environment}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Supabase URL:</span>
              {supabaseUrl ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm text-gray-600">{supabaseUrl ? "✓ Set" : "✗ Missing"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Supabase Key:</span>
              {supabaseKey ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm text-gray-600">{supabaseKey ? "✓ Set" : "✗ Missing"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Client Initialized:</span>
              {supabase ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm text-gray-600">{supabase ? "✓ Yes" : "✗ No"}</span>
            </div>
            {supabaseUrl && (
              <div className="mt-4">
                <span className="text-sm font-medium">URL:</span>
                <div className="mt-1 p-2 bg-gray-100 rounded text-sm font-mono break-all">{supabaseUrl}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
              Authentication Status
            </CardTitle>
            <CardDescription>Current user session information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <Badge variant={user ? "default" : "destructive"}>{user ? "Authenticated" : "Not Authenticated"}</Badge>
            </div>
            {user && (
              <>
                <div className="flex justify-between items-center">
                  <span>User ID:</span>
                  <span className="text-sm font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Email:</span>
                  <span className="text-sm">{user.email}</span>
                </div>
              </>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Auth Check Results */}
      {authCheckResult && (
        <Card>
          <CardHeader>
            <CardTitle>Auth Check Results</CardTitle>
            <CardDescription>Results from /api/auth/check endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Authenticated:</span>
                <Badge variant={authCheckResult.authenticated ? "default" : "destructive"}>
                  {authCheckResult.authenticated ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Needs Setup:</span>
                <Badge variant={authCheckResult.needsSetup ? "destructive" : "default"}>
                  {authCheckResult.needsSetup ? "Yes" : "No"}
                </Badge>
              </div>
              {authCheckResult.debug && (
                <div className="mt-4">
                  <span className="text-sm font-medium">Debug Info:</span>
                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(authCheckResult.debug, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Test authentication functions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {authCheckResult?.needsSetup && (
            <Button onClick={handleQuickSetup} disabled={settingUp} className="w-full" variant="default">
              <Settings className="w-4 h-4 mr-2" />
              {settingUp ? "Setting up..." : "Quick Setup (Create Profile & Company)"}
            </Button>
          )}
          <Button onClick={testLogin} variant="outline" className="w-full">
            Test Login (Pre-filled Credentials)
          </Button>
          {user && (
            <Button onClick={signOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Cookies */}
      <Card>
        <CardHeader>
          <CardTitle>Cookies</CardTitle>
          <CardDescription>Current browser cookies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-2 bg-gray-100 rounded text-xs font-mono break-all max-h-32 overflow-auto">
            {cookies || "No cookies found"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
