"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function ProductionSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<any>(null)

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/check")
      const data = await response.json()
      setAuthStatus({ status: response.status, data })
    } catch (error) {
      setAuthStatus({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const runAutoSetup = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await fetch("/api/auth/auto-setup", {
        method: "POST",
      })
      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Production Setup Debug</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Auth Status Check
            </CardTitle>
            <CardDescription>Check current authentication and profile status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkAuthStatus} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Auth Status"
              )}
            </Button>

            {authStatus && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {authStatus.status === 200 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">Status: {authStatus.status || "Error"}</span>
                </div>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(authStatus.data || authStatus.error, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Auto Setup
            </CardTitle>
            <CardDescription>Automatically create profile and company for current user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runAutoSetup} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Run Auto Setup"
              )}
            </Button>

            {result && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {result.status === 200 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">Status: {result.status || "Error"}</span>
                </div>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Production Setup Instructions:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>First, check your auth status to see what's missing</li>
            <li>If you need setup, click "Run Auto Setup" to create profile and company</li>
            <li>Alternatively, run the SQL script in your Supabase dashboard</li>
            <li>After setup, refresh the main application</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  )
}
