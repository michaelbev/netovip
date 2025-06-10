"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"

export default function SimpleDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createBrowserClient(
          "https://ygmysskhrhojvkkrcbkl.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbXlzc2tocmhvanZra3JjYmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTQ0NDgsImV4cCI6MjA2NTA3MDQ0OH0.RjrYUKEVCG8nynLDvDe8ZfC5gAzZd9Jlcun2HMc0p8c",
        )

        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient(
        "https://ygmysskhrhojvkkrcbkl.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbXlzc2tocmhvanZra3JjYmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTQ0NDgsImV4cCI6MjA2NTA3MDQ0OH0.RjrYUKEVCG8nynLDvDe8ZfC5gAzZd9Jlcun2HMc0p8c",
      )

      await supabase.auth.signOut()
      setUser(null)
      window.location.href = "/login-simple"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-4">Not Logged In</h2>
            <p className="text-gray-600 mb-4">You need to log in to access this page.</p>
            <Button asChild>
              <a href="/login-simple">Go to Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>✅ Login Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">User Information:</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>User ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Created:</strong> {new Date(user.created_at).toLocaleString()}
                </p>
                <p>
                  <strong>Last Sign In:</strong>{" "}
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "First time"}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
              <Button asChild>
                <a href="/">Go to Main App</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
