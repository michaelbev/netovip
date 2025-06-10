"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"

export default function SimpleLoginPage() {
  const [email, setEmail] = useState("asdfds@asdfads.com")
  const [password, setPassword] = useState("ahhahh")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleLogin = async () => {
    setLoading(true)
    setMessage("")

    try {
      // Create Supabase client directly
      const supabase = createBrowserClient(
        "https://ygmysskhrhojvkkrcbkl.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbXlzc2tocmhvanZra3JjYmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTQ0NDgsImV4cCI6MjA2NTA3MDQ0OH0.RjrYUKEVCG8nynLDvDe8ZfC5gAzZd9Jlcun2HMc0p8c",
      )

      console.log("Attempting login with:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        console.error("Login error:", error)
        setMessage(`❌ Login failed: ${error.message}`)
        return
      }

      if (data.user) {
        console.log("✅ Login successful:", data.user)
        setMessage(`✅ Login successful! User ID: ${data.user.id}`)

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)
      setMessage(`❌ Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    setLoading(true)
    setMessage("")

    try {
      // Create Supabase client directly
      const supabase = createBrowserClient(
        "https://ygmysskhrhojvkkrcbkl.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbXlzc2tocmhvanZra3JjYmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0OTQ0NDgsImV4cCI6MjA2NTA3MDQ0OH0.RjrYUKEVCG8nynLDvDe8ZfC5gAzZd9Jlcun2HMc0p8c",
      )

      console.log("Creating user:", email)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      })

      if (error) {
        console.error("Signup error:", error)
        setMessage(`❌ Signup failed: ${error.message}`)
        return
      }

      if (data.user) {
        console.log("✅ User created:", data.user)
        setMessage(`✅ User created successfully! Check your email for confirmation.`)
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)
      setMessage(`❌ Unexpected error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Simple Login Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <div className="space-y-2">
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Button onClick={createUser} disabled={loading} variant="outline" className="w-full">
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>

          {message && <div className="p-3 rounded-lg bg-gray-100 text-sm">{message}</div>}

          <div className="text-xs text-gray-500 space-y-1">
            <p>• If login fails, try "Create User" first</p>
            <p>• Check browser console for detailed logs</p>
            <p>• This bypasses all complex auth flows</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
