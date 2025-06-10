"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"

export default function AuthTestPage() {
  const [clientAuth, setClientAuth] = useState<any>(null)
  const [serverAuth, setServerAuth] = useState<any>(null)
  const [cookies, setCookies] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkClientAuth = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      setClientAuth({
        user: user ? { id: user.id, email: user.email } : null,
        session: session ? { hasAccessToken: !!session.access_token } : null,
        errors: {
          userError: userError?.message,
          sessionError: sessionError?.message,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error checking client auth")
      console.error("Client auth check error:", err)
    } finally {
      setLoading(false)
    }
  }

  const checkServerAuth = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/debug/auth")
      const data = await response.json()

      if (data.status === "error") {
        throw new Error(data.message || "Server auth check failed")
      }

      setServerAuth(data.auth)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error checking server auth")
      console.error("Server auth check error:", err)
    } finally {
      setLoading(false)
    }
  }

  const checkCookies = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/debug/cookies")
      const data = await response.json()

      if (data.status === "error") {
        throw new Error(data.message || "Cookie check failed")
      }

      setCookies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error checking cookies")
      console.error("Cookie check error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkClientAuth()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Auth</CardTitle>
            <CardDescription>Authentication state in the browser</CardDescription>
          </CardHeader>
          <CardContent>
            {clientAuth ? (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(clientAuth, null, 2)}
              </pre>
            ) : (
              <p>No client auth data</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkClientAuth} disabled={loading}>
              {loading ? "Checking..." : "Check Client Auth"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Auth</CardTitle>
            <CardDescription>Authentication state on the server</CardDescription>
          </CardHeader>
          <CardContent>
            {serverAuth ? (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(serverAuth, null, 2)}
              </pre>
            ) : (
              <p>No server auth data</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkServerAuth} disabled={loading}>
              {loading ? "Checking..." : "Check Server Auth"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
            <CardDescription>Cookie information</CardDescription>
          </CardHeader>
          <CardContent>
            {cookies ? (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(cookies, null, 2)}
              </pre>
            ) : (
              <p>No cookie data</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkCookies} disabled={loading}>
              {loading ? "Checking..." : "Check Cookies"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
