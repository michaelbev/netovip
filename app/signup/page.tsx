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

    try {
      // 1. Create user account
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

      if (authError) throw authError

      if (authData.user) {
        // 2. Create company via API route
        const response = await fetch("/api/companies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: companyName,
            email: email,
            userId: authData.user.id,
            userName: fullName,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create company")
        }
      }

      setSuccess("Company account created successfully! Please check your email to verify your account.")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  const handleIndividualSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Verify invitation code
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

      if (authError) throw authError

      // 3. Delete the invitation
      await supabase.from("tenant_invitations").delete().eq("token", inviteCode)

      setSuccess("Account created successfully! Please check your email to verify your account.")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Droplets className="h-12 w-12 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Netovip Accounting</h1>
          <p className="text-gray-600">Oil & Gas Operations Platform</p>
        </div>

        {envError ? (
          <Card>
            <CardHeader>
              <CardTitle>Environment Error</CardTitle>
              <CardDescription>Missing Supabase configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                <p className="font-medium">Environment variables not configured.</p>
                <p className="mt-2">Please set the following environment variables in your Vercel project:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company">New Company</TabsTrigger>
              <TabsTrigger value="individual">Join Existing</TabsTrigger>
            </TabsList>

            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Create Company Account</CardTitle>
                  <CardDescription>Set up a new tenant for your organization</CardDescription>
                </CardHeader>
                <form onSubmit={handleCompanySignup}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        placeholder="Your Company LLC"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Your Name</Label>
                      <Input
                        id="full-name"
                        placeholder="John Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Company Account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="individual">
              <Card>
                <CardHeader>
                  <CardTitle>Join Existing Company</CardTitle>
                  <CardDescription>Use your invitation code to join</CardDescription>
                </CardHeader>
                <form onSubmit={handleIndividualSignup}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invite-code">Invitation Code</Label>
                      <Input
                        id="invite-code"
                        placeholder="Enter your invitation code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="individual-email">Email</Label>
                      <Input
                        id="individual-email"
                        type="email"
                        placeholder="you@example.com"
                        value={individualEmail}
                        onChange={(e) => setIndividualEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="individual-password">Password</Label>
                      <Input
                        id="individual-password"
                        type="password"
                        value={individualPassword}
                        onChange={(e) => setIndividualPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Joining..." : "Join Company"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
        {success && <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">{success}</div>}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-teal-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
