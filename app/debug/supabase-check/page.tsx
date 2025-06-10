"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, AlertCircle, Loader2, Database, Key, User, Settings } from "lucide-react"

interface DiagnosticResult {
  category: string
  checks: Array<{
    name: string
    status: "pass" | "fail" | "warning"
    message: string
    details?: string
  }>
}

export default function SupabaseCheckPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [testEmail, setTestEmail] = useState("asdfds@asdfads.com")
  const [testPassword, setTestPassword] = useState("ahhahh")
  const [loginTestResult, setLoginTestResult] = useState<any>(null)
  const [loginTesting, setLoginTesting] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    setResults([])

    try {
      const response = await fetch("/api/debug/supabase-check")
      const data = await response.json()

      if (data.results) {
        setResults(data.results)
      } else {
        setResults([
          {
            category: "Error",
            checks: [
              {
                name: "API Response",
                status: "fail",
                message: data.error || "Failed to run diagnostic",
              },
            ],
          },
        ])
      }
    } catch (error: any) {
      setResults([
        {
          category: "Error",
          checks: [
            {
              name: "Network Error",
              status: "fail",
              message: `Failed to connect to diagnostic API: ${error.message}`,
            },
          ],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoginTesting(true)
    setLoginTestResult(null)

    try {
      const response = await fetch("/api/debug/test-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      })

      const data = await response.json()
      setLoginTestResult(data)
    } catch (error: any) {
      setLoginTestResult({
        success: false,
        error: `Network error: ${error.message}`,
      })
    } finally {
      setLoginTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pass":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Pass
          </Badge>
        )
      case "fail":
        return <Badge variant="destructive">Fail</Badge>
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Warning
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "environment":
        return <Settings className="h-5 w-5" />
      case "authentication":
        return <Key className="h-5 w-5" />
      case "database":
        return <Database className="h-5 w-5" />
      case "user":
        return <User className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supabase Diagnostic Tool</h1>
        <p className="text-gray-600">Comprehensive analysis of your Supabase configuration and authentication setup</p>
      </div>

      {/* Run Diagnostic */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Diagnostic
          </CardTitle>
          <CardDescription>
            Run a comprehensive check of your Supabase configuration, authentication settings, and database setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostic} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostic...
              </>
            ) : (
              "Run Full Diagnostic"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Login */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Test Login
          </CardTitle>
          <CardDescription>Test authentication with specific credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEmail">Email</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email to test"
              />
            </div>
            <div>
              <Label htmlFor="testPassword">Password</Label>
              <Input
                id="testPassword"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Enter password to test"
              />
            </div>
          </div>
          <Button onClick={testLogin} disabled={loginTesting || !testEmail || !testPassword} className="w-full">
            {loginTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Login...
              </>
            ) : (
              "Test Login"
            )}
          </Button>

          {loginTestResult && (
            <div
              className={`p-4 rounded-lg ${loginTestResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {loginTestResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${loginTestResult.success ? "text-green-800" : "text-red-800"}`}>
                  {loginTestResult.success ? "Login Successful" : "Login Failed"}
                </span>
              </div>
              <p className={`text-sm ${loginTestResult.success ? "text-green-700" : "text-red-700"}`}>
                {loginTestResult.message || loginTestResult.error}
              </p>
              {loginTestResult.details && (
                <details className="mt-2">
                  <summary
                    className={`text-xs cursor-pointer ${loginTestResult.success ? "text-green-600" : "text-red-600"}`}
                  >
                    Show Details
                  </summary>
                  <pre
                    className={`text-xs mt-1 p-2 rounded ${loginTestResult.success ? "bg-green-100" : "bg-red-100"}`}
                  >
                    {JSON.stringify(loginTestResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Diagnostic Results</h2>
          {results.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category.category)}
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.checks.map((check, checkIndex) => (
                    <div key={checkIndex} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="flex-shrink-0 mt-0.5">{getStatusIcon(check.status)}</div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{check.name}</span>
                          {getStatusBadge(check.status)}
                        </div>
                        <p className="text-sm text-gray-600">{check.message}</p>
                        {check.details && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">Show Details</summary>
                            <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">{check.details}</pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common troubleshooting steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/debug/users">Check Existing Users</a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/signup">Create New Account</a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/login">Try Login Page</a>
          </Button>
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/debug/env-check">Check Environment Variables</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
