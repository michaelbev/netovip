"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Droplets } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [envError, setEnvError] = useState(false)

  // Company signup form state
  const [companyName, setCompanyName] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Individual signup form state
  const [individualEmail, setIndividualEmail] = useState("")
  const [individualPassword, setIndividualPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")

  useEffect(() => {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setEnvError(true)
    }
  }, [])

  const handleCompanySignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Starting company signup process...")

      // 1. Create user account first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      })

      if (authError) {
        console.error("Auth signup error:", authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error("User creation failed - no user data returned")
      }

      console.log("User created successfully:", authData.user.id)

      // 2. Wait a moment for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 3. Get the current session to ensure we're authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        throw new Error("Failed to establish session")
      }

      console.log("Session established:", !!sessionData.session)

      // 4. Create company and profile using the admin client approach
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include the session token if available
          ...(sessionData.session?.access_token && {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          }),
        },
        body: JSON.stringify({
          name: companyName,
          email: email,
          userId: authData.user.id,
          userName: fullName,
          // Include session info for verification
          sessionToken: sessionData.session?.access_token,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("Company creation failed:", responseData)
        throw new Error(responseData.error || "Failed to create company")
      }

      console.log("Company created successfully:", responseData)

      setSuccess("Account created successfully! Please check your email to verify your account, then you can sign in.")

      // Clear form
      setCompanyName("")
      setFullName("")
      setEmail("")
      setPassword("")

      // Redirect after a delay
      setTimeout(() => {
        router.push("/login?message=signup-success")
      }, 3000)
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  const handleIndividualSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Starting individual signup process...")

      // 1. Verify invitation code first
      const { data: inviteData, error: inviteError } = await supabase
        .from("tenant_invitations")
        .select("company_id, role, email")
        .eq("token", inviteCode)
        .single()

      if (inviteError || !inviteData) {
        throw new Error("Invalid or expired invitation code")
      }

      if (inviteData.email !== individualEmail) {
        throw new Error("Email doesn't match the invitation")
      }

      console.log("Invitation verified:", inviteData)

      // 2. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: individualEmail,
        password: individualPassword,
        options: {
          data: {
            company_id: inviteData.company_id,
            role: inviteData.role,
          },
        },
      })

      if (authError) {
        console.error("Auth signup error:", authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error("User creation failed")
      }

      console.log("User created successfully:", authData.user.id)

      // 3. Create profile directly using admin approach
      const profileResponse = await fetch("/api/auth/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authData.user.id,
          email: individualEmail,
          companyId: inviteData.company_id,
          role: inviteData.role,
        }),
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(errorData.error || "Failed to create profile")
      }

      // 4. Delete the invitation
      const { error: deleteError } = await supabase.from("tenant_invitations").delete().eq("token", inviteCode)

      if (deleteError) {
        console.warn("Failed to delete invitation:", deleteError)
      }

      setSuccess("Account created successfully! Please check your email to verify your account, then you can sign in.")

      // Clear form
      setIndividualEmail("")
      setIndividualPassword("")
      setInviteCode("")

      setTimeout(() => {
        router.push("/login?message=signup-success")
      }, 3000)
    } catch (err: any) {
      console.error("Individual signup error:", err)
      setError(err.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
              <Droplets className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Netovip Accounting</h1>
          <p className="text-gray-600 mt-2">Oil & Gas Operations Platform</p>
        </div>

        {envError ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-red-600">Environment Error</CardTitle>
              <CardDescription>Missing Supabase configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="font-medium text-yellow-800">Environment variables not configured.</p>
                <p className="mt-2 text-sm text-yellow-700">Please set the following environment variables:</p>
                <ul className="list-disc pl-5 mt-2 text-sm text-yellow-700">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="company">New Company</TabsTrigger>
              <TabsTrigger value="individual">Join Existing</TabsTrigger>
            </TabsList>

            <TabsContent value="company">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Create Company Account</CardTitle>
                  <CardDescription>Set up a new tenant for your organization</CardDescription>
                </CardHeader>
                <form onSubmit={handleCompanySignup}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name *</Label>
                      <Input
                        id="company-name"
                        placeholder="Your Company LLC"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Your Name *</Label>
                      <Input
                        id="full-name"
                        placeholder="John Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Choose a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full h-11 bg-teal-600 hover:bg-teal-700" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Company Account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="individual">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Join Existing Company</CardTitle>
                  <CardDescription>Use your invitation code to join</CardDescription>
                </CardHeader>
                <form onSubmit={handleIndividualSignup}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-code">Invitation Code *</Label>
                      <Input
                        id="invite-code"
                        placeholder="Enter your invitation code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="individual-email">Email *</Label>
                      <Input
                        id="individual-email"
                        type="email"
                        placeholder="you@example.com"
                        value={individualEmail}
                        onChange={(e) => setIndividualEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="individual-password">Password *</Label>
                      <Input
                        id="individual-password"
                        type="password"
                        placeholder="Choose a strong password"
                        value={individualPassword}
                        onChange={(e) => setIndividualPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full h-11 bg-teal-600 hover:bg-teal-700" disabled={loading}>
                      {loading ? "Joining..." : "Join Company"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-teal-600 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
