"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context-mock"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
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
        <h1 className="text-3xl font-bold">Development Auth Debug (Demo Mode)</h1>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-800">Demo Mode Active</span>
        </div>
        <p className="text-blue-700 mt-1">This page is using mock authentication for demonstration purposes.</p>
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
              <span>Demo Mode:</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">✓ Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Mock Auth:</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">✓ Enabled</span>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
              Authentication Status (Mock)
            </CardTitle>
            <CardDescription>Current demo user session information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Status:</span>
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Authenticated (Demo)" : "Not Authenticated"}
              </Badge>
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

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Actions</CardTitle>
          <CardDescription>Test demo authentication functions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={testLogin} variant="outline" className="w-full">
            Test Mock Login
          </Button>
          {user && (
            <Button onClick={signOut} variant="outline" className="w-full">
              Mock Sign Out (Stays Signed In)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Demo Info */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Information</CardTitle>
          <CardDescription>Current demo session details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-2 bg-gray-100 rounded text-xs font-mono break-all max-h-32 overflow-auto">
            Demo Mode: All authentication is mocked for presentation purposes.
            <br />
            User: {user?.email || "Not loaded"}
            <br />
            Company: Demo Oil & Gas Company
            <br />
            Role: Administrator
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
