"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@supabase/ssr"

export default function LoginDiagnostic() {
  const [email, setEmail] = useState("asdfds@asdfads.com")
  const [password, setPassword] = useState("ahhahh")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (step: string, success: boolean, data: any) => {
    setResults((prev) => [...prev, { step, success, data, timestamp: new Date().toISOString() }])
  }

  const runDiagnostic = async () => {
    setLoading(true)
    setResults([])

    try {
      // Step 1: Check environment and setup
      addResult("Starting diagnostic", true, {
        email,
        password: "***",
        timestamp: new Date().toISOString(),
      })

      // Step 2: Create Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      addResult("Supabase client created", true, "Browser client initialized successfully")

      // Step 3: Check current session
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        addResult("Current session check", !sessionError, {
          hasSession: !!sessionData.session,
          user: sessionData.session?.user?.email || null,
          error: sessionError,
        })
      } catch (err) {
        addResult("Current session check", false, err)
      }

      // Step 4: Try login attempt
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        })

        if (loginError) {
          addResult("Login attempt", false, {
            error: loginError.message,
            status: loginError.status,
            code: loginError.name,
            details: loginError,
          })
        } else {
          addResult("Login attempt", true, {
            user: {
              id: loginData.user?.id,
              email: loginData.user?.email,
              email_confirmed_at: loginData.user?.email_confirmed_at,
              created_at: loginData.user?.created_at,
              last_sign_in_at: loginData.user?.last_sign_in_at,
            },
            session: !!loginData.session,
            sessionExpiry: loginData.session?.expires_at,
          })
        }
      } catch (err) {
        addResult("Login attempt", false, err)
      }

      // Step 5: Try password reset (this tells us if user exists)
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        addResult("Password reset test", !resetError, {
          message: resetError ? resetError.message : "Reset email would be sent (user exists)",
          error: resetError,
        })
      } catch (err) {
        addResult("Password reset test", false, err)
      }

      // Step 6: Check user via API
      try {
        const response = await fetch("/api/debug/users")
        if (response.ok) {
          const userData = await response.json()
          const userExists = userData.users?.find((u: any) => u.email === email)
          addResult("API user check", true, {
            userExists: !!userExists,
            userDetails: userExists || null,
            totalUsers: userData.users?.length || 0,
          })
        } else {
          const errorText = await response.text()
          addResult("API user check", false, {
            status: response.status,
            error: errorText,
          })
        }
      } catch (err) {
        addResult("API user check", false, err)
      }

      // Step 7: Test sign up (to see if user already exists)
      try {
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        })

        if (signupError) {
          addResult("Signup test", false, {
            error: signupError.message,
            code: signupError.name,
            details: signupError,
            interpretation: signupError.message.includes("already") ? "User already exists" : "Other signup error",
          })
        } else {
          addResult("Signup test", true, {
            user: signupData.user,
            session: !!signupData.session,
            interpretation: "User was created or already exists",
          })
        }
      } catch (err) {
        addResult("Signup test", false, err)
      }
    } catch (error) {
      addResult("Diagnostic failed", false, error)
    } finally {
      setLoading(false)
    }
  }

  const fixUser = async () => {
    setLoading(true)

    try {
      // Try to create/fix the user via API
      const response = await fetch("/api/create-user-simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()
      addResult("Fix user attempt", result.success, result)

      // If successful, try login again
      if (result.success) {
        setTimeout(async () => {
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          )

          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password,
          })

          addResult("Post-fix login test", !loginError, {
            success: !loginError,
            error: loginError,
            user: loginData?.user?.email,
          })
        }, 2000) // Wait 2 seconds for user creation to propagate
      }
    } catch (error) {
      addResult("Fix user attempt", false, error)
    } finally {
      setLoading(false)
    }
  }

  const testDirectLogin = async () => {
    setLoading(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      // Clear any existing session first
      await supabase.auth.signOut()

      addResult("Direct login test", true, "Starting fresh login attempt...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        addResult("Direct login result", false, {
          error: error.message,
          code: error.name,
          status: error.status,
          details: error,
        })
      } else {
        addResult("Direct login result", true, {
          success: true,
          user: data.user?.email,
          session: !!data.session,
        })
      }
    } catch (error) {
      addResult("Direct login test", false, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Login Diagnostic Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <Button onClick={runDiagnostic} disabled={loading}>
                {loading ? "Running..." : "🔍 Run Full Diagnostic"}
              </Button>
              <Button onClick={testDirectLogin} disabled={loading} variant="outline">
                {loading ? "Testing..." : "🎯 Test Direct Login"}
              </Button>
              <Button onClick={fixUser} disabled={loading} variant="secondary">
                {loading ? "Fixing..." : "🔧 Fix User"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Diagnostic Results</CardTitle>
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
