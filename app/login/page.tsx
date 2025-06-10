"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Droplets, Loader2, Eye, EyeOff, AlertCircle, Users } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [envError, setEnvError] = useState(false)

  useEffect(() => {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvError(true)
      return
    }

    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session) {
          console.log("User already logged in, redirecting...")
          router.push(redirectTo)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }

    checkUser()
  }, [router, redirectTo])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Attempting login for:", email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        console.error("Auth error:", authError)

        // Provide more helpful error messages
        let userFriendlyError = "An error occurred during login"

        switch (authError.message) {
          case "Invalid login credentials":
            userFriendlyError = `No account found with email "${email}". Please check your email address or sign up for a new account.`
            break
          case "Email not confirmed":
            userFriendlyError = "Please check your email and click the confirmation link before logging in."
            break
          case "Too many requests":
            userFriendlyError = "Too many login attempts. Please wait a few minutes before trying again."
            break
          case "User not found":
            userFriendlyError = "No account found with this email address. Please sign up first."
            break
          default:
            userFriendlyError = authError.message || "Login failed. Please try again."
        }

        throw new Error(userFriendlyError)
      }

      if (data.user) {
        console.log("Login successful, user:", data.user.id)

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("company_id, role")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile error:", profileError)
        }

        if (!profile) {
          console.log("No profile found, creating one...")
          // If profile doesn't exist, create one
          const { error: createError } = await supabase.from("profiles").insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || null,
          })

          if (createError) {
            console.error("Failed to create profile:", createError)
          }
        }

        console.log("Profile check complete, redirecting to:", redirectTo)

        // Force a hard navigation to ensure middleware runs
        window.location.href = redirectTo
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "An error occurred during login!")
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = () => {
    setEmail("mebevilacqua@gmail.com")
    setPassword("gnL1yoi@ObcX6gYi")
  }

  const handleYourCredentials = () => {
    setEmail("asdfds@asdfads.com")
    setPassword("ahhahh")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-teal-600 rounded-full">
              <Droplets className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Netovip Accounting</h1>
          <p className="text-gray-600">Oil & Gas Operations Platform</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {envError && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Configuration Required</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Environment variables not configured. Please set NEXT_PUBLIC_SUPABASE_URL and
                        NEXT_PUBLIC_SUPABASE_ANON_KEY.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={envError || loading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={envError || loading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Credential helpers */}
              <div className="flex justify-center space-x-4 text-xs">
                <button
                  type="button"
                  onClick={handleTestLogin}
                  className="text-teal-600 hover:text-teal-700 underline"
                  disabled={loading}
                >
                  Use test credentials
                </button>
                <button
                  type="button"
                  onClick={handleYourCredentials}
                  className="text-blue-600 hover:text-blue-700 underline"
                  disabled={loading}
                >
                  Use your credentials
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full h-11 bg-teal-600 hover:bg-teal-700"
                disabled={loading || envError || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a href="/signup" className="text-teal-600 hover:text-teal-700 font-medium hover:underline">
                    Sign up
                  </a>
                </p>
                <p className="text-xs text-gray-500">
                  <a
                    href="/debug/users"
                    className="text-gray-400 hover:text-gray-600 underline flex items-center justify-center"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Check existing users
                  </a>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {error.includes("No account found") && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-red-600 font-medium">What you can do:</p>
                    <div className="text-xs text-red-600 space-y-1">
                      <p>
                        •{" "}
                        <a href="/signup" className="underline hover:text-red-800">
                          Create a new account
                        </a>{" "}
                        with this email
                      </p>
                      <p>
                        •{" "}
                        <a href="/debug/users" className="underline hover:text-red-800">
                          Check what users exist
                        </a>{" "}
                        in the system
                      </p>
                      <p>• Use the "Use test credentials" button to try with known working credentials</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">Secure login powered by Supabase</p>
        </div>
      </div>
    </div>
  )
}
