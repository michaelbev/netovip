"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"

export default function FixLogin() {
  const [email, setEmail] = useState("asdfds@asdfads.com")
  const [password, setPassword] = useState("ahhahh")
  const [newPassword, setNewPassword] = useState("ahhahh123!")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")
  const [serviceRoleKey, setServiceRoleKey] = useState("")

  useEffect(() => {
    // Get environment variables from window
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    setSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")

    // This is just for display, we'll use a server API for admin operations
    setServiceRoleKey("***************")
  }, [])

  const addResult = (step: string, success: boolean, data: any) => {
    setResults((prev) => [...prev, { step, success, data, timestamp: new Date().toISOString() }])
  }

  const resetPassword = async () => {
    setLoading(true)
    try {
      // Use server API to reset password
      const response = await fetch("/api/debug/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      })

      const result = await response.json()

      if (result.success) {
        addResult("Password reset", true, {
          message: "Password has been reset successfully",
          details: result,
        })
        // Update the password state to the new password
        setPassword(newPassword)
      } else {
        addResult("Password reset", false, {
          error: result.error,
          details: result,
        })
      }
    } catch (error: any) {
      addResult("Password reset", false, {
        error: error.message,
        details: error,
      })
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const supabase = createBrowserClient(supabaseUrl, supabaseKey)

      // Clear any existing session
      await supabase.auth.signOut()

      addResult("Login test", true, {
        message: "Starting login test with current password",
        email,
        password: "********",
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        addResult("Login result", false, {
          error: error.message,
          code: error.name,
          status: error.status,
        })
      } else {
        addResult("Login result", true, {
          user: data.user?.email,
          userId: data.user?.id,
          session: !!data.session,
        })
      }
    } catch (error: any) {
      addResult("Login test", false, {
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const checkUserStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.success) {
        addResult("User status check", true, {
          user: result.user,
          exists: result.exists,
        })
      } else {
        addResult("User status check", false, {
          error: result.error,
        })
      }
    } catch (error: any) {
      addResult("User status check", false, {
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteAndRecreateUser = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/recreate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      })

      const result = await response.json()

      if (result.success) {
        addResult("User recreation", true, {
          message: "User has been deleted and recreated successfully",
          details: result,
        })
        // Update the password state to the new password
        setPassword(newPassword)
      } else {
        addResult("User recreation", false, {
          error: result.error,
          details: result,
        })
      }
    } catch (error: any) {
      addResult("User recreation", false, {
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Fix Login Issues</CardTitle>
            <CardDescription>
              This tool will help diagnose and fix login issues with your Supabase account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Current Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password (for reset)</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Strong password for reset"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Supabase URL</Label>
                <Input value={supabaseUrl} disabled />
              </div>
              <div>
                <Label>Supabase Anon Key</Label>
                <Input value={supabaseKey.substring(0, 10) + "..."} disabled />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={testLogin} disabled={loading}>
                {loading ? "Testing..." : "🔑 Test Login"}
              </Button>
              <Button onClick={checkUserStatus} disabled={loading} variant="outline">
                {loading ? "Checking..." : "👤 Check User Status"}
              </Button>
              <Button onClick={resetPassword} disabled={loading} variant="secondary">
                {loading ? "Resetting..." : "🔄 Reset Password"}
              </Button>
              <Button onClick={deleteAndRecreateUser} disabled={loading} variant="destructive">
                {loading ? "Recreating..." : "♻️ Delete & Recreate User"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      result.success ? "bg-green-50 border-green-400" : "bg-red-50 border-red-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={result.success ? "text-green-600" : "text-red-600"}>
                        {result.success ? "✅" : "❌"}
                      </span>
                      <span className="font-medium">{result.step}</span>
                      <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
