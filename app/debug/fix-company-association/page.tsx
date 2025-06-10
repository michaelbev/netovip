"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

export default function FixCompanyAssociation() {
  const [loading, setLoading] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(false)
  const [profileStatus, setProfileStatus] = useState<any>(null)
  const [creatingRecords, setCreatingRecords] = useState(false)
  const [createResult, setCreateResult] = useState<any>(null)
  const [testingAuth, setTestingAuth] = useState(false)
  const [authCheckResult, setAuthCheckResult] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  async function checkCurrentUser() {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      return user?.id
    } catch (error) {
      console.error("Error checking user:", error)
      return null
    } finally {
      setLoading(false)
    }
  }

  async function checkProfile() {
    setCheckingProfile(true)
    const uid = await checkCurrentUser()

    if (!uid) {
      setProfileStatus({ error: "No authenticated user found. Please login first." })
      setCheckingProfile(false)
      return
    }

    try {
      const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", uid).single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        setProfileStatus({
          exists: false,
          error: profileError.message,
          message: "No profile found for your user ID. You need to create a profile.",
        })
        return
      }

      if (!profile) {
        setProfileStatus({
          exists: false,
          message: "No profile found for your user ID. You need to create a profile.",
        })
        return
      }

      // Check company association
      if (!profile.company_id) {
        setProfileStatus({
          exists: true,
          profile,
          hasCompany: false,
          message: "Profile exists but is not associated with any company.",
        })
        return
      }

      // Get company details
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single()

      if (companyError || !company) {
        setProfileStatus({
          exists: true,
          profile,
          hasCompany: false,
          error: companyError?.message || "Company not found",
          message: "Profile references a company that does not exist.",
        })
        return
      }

      setProfileStatus({
        exists: true,
        profile,
        company,
        hasCompany: true,
        message: "Profile and company association found.",
      })
    } catch (error: any) {
      console.error("Error checking profile:", error)
      setProfileStatus({ error: error.message || "Unknown error checking profile" })
    } finally {
      setCheckingProfile(false)
    }
  }

  async function createProfileAndCompany() {
    setCreatingRecords(true)
    const uid = await checkCurrentUser()

    if (!uid) {
      setCreateResult({ error: "No authenticated user found. Please login first." })
      setCreatingRecords(false)
      return
    }

    try {
      // First check if profile already exists
      const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", uid).single()

      // Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: "My Oil & Gas Company",
            created_by: uid,
            status: "active",
            company_type: "operator",
            address: "123 Main St",
            city: "Houston",
            state: "TX",
            zip: "77001",
            phone: "555-123-4567",
            email: "contact@myoilgascompany.com",
          },
        ])
        .select()
        .single()

      if (companyError) {
        setCreateResult({ error: `Error creating company: ${companyError.message}` })
        return
      }

      let profileResult

      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({
            company_id: company.id,
            role: "admin",
            updated_at: new Date().toISOString(),
          })
          .eq("id", uid)
          .select()
          .single()

        if (updateError) {
          setCreateResult({ error: `Error updating profile: ${updateError.message}` })
          return
        }

        profileResult = updatedProfile
      } else {
        // Create new profile
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: uid,
              company_id: company.id,
              role: "admin",
              first_name: "User",
              last_name: "Account",
              email: (await supabase.auth.getUser()).data.user?.email || "",
              status: "active",
            },
          ])
          .select()
          .single()

        if (profileError) {
          setCreateResult({ error: `Error creating profile: ${profileError.message}` })
          return
        }

        profileResult = newProfile
      }

      // Create user_companies association
      const { error: userCompanyError } = await supabase.from("user_companies").insert([
        {
          user_id: uid,
          company_id: company.id,
          role: "admin",
          status: "active",
        },
      ])

      if (userCompanyError) {
        setCreateResult({
          warning: `Profile and company created, but error creating user_companies association: ${userCompanyError.message}`,
          profile: profileResult,
          company,
        })
        return
      }

      setCreateResult({
        success: true,
        message: "Successfully created profile and company association!",
        profile: profileResult,
        company,
      })

      // Refresh profile status
      await checkProfile()
    } catch (error: any) {
      console.error("Error creating records:", error)
      setCreateResult({ error: error.message || "Unknown error creating records" })
    } finally {
      setCreatingRecords(false)
    }
  }

  async function testAuthCheck() {
    setTestingAuth(true)
    try {
      const response = await fetch("/api/auth/check")
      const data = await response.json()

      setAuthCheckResult({
        status: response.status,
        ok: response.ok,
        data,
      })
    } catch (error: any) {
      console.error("Error testing auth check:", error)
      setAuthCheckResult({ error: error.message || "Unknown error testing auth check" })
    } finally {
      setTestingAuth(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Fix Company Association</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Check Current User</CardTitle>
            <CardDescription>Verify your current authentication status</CardDescription>
          </CardHeader>
          <CardContent>
            {userId ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Authenticated</AlertTitle>
                <AlertDescription>
                  User ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{userId}</code>
                </AlertDescription>
              </Alert>
            ) : loading ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking authentication status...</span>
              </div>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertTitle>Not Authenticated</AlertTitle>
                <AlertDescription>Please login before continuing.</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkCurrentUser} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Authentication"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 2: Check Profile Status</CardTitle>
            <CardDescription>Check if you have a profile and company association</CardDescription>
          </CardHeader>
          <CardContent>
            {checkingProfile ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking profile status...</span>
              </div>
            ) : profileStatus ? (
              <div className="space-y-4">
                {profileStatus.error ? (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{profileStatus.error}</AlertDescription>
                  </Alert>
                ) : profileStatus.exists ? (
                  <>
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle>Profile Found</AlertTitle>
                      <AlertDescription>Your profile exists in the database.</AlertDescription>
                    </Alert>

                    {profileStatus.hasCompany ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Company Association Found</AlertTitle>
                        <AlertDescription>
                          Your profile is associated with company: {profileStatus.company?.name || "Unknown"}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle>No Company Association</AlertTitle>
                        <AlertDescription>{profileStatus.message}</AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>No Profile Found</AlertTitle>
                    <AlertDescription>{profileStatus.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Click the button below to check your profile status.</div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkProfile} disabled={checkingProfile || !userId}>
              {checkingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Profile Status"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 3: Create Profile & Company</CardTitle>
            <CardDescription>Create missing profile and company records</CardDescription>
          </CardHeader>
          <CardContent>
            {creatingRecords ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating records...</span>
              </div>
            ) : createResult ? (
              <div className="space-y-4">
                {createResult.error ? (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{createResult.error}</AlertDescription>
                  </Alert>
                ) : createResult.warning ? (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>Partial Success</AlertTitle>
                    <AlertDescription>{createResult.warning}</AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{createResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                Click the button below to create your profile and company association.
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={createProfileAndCompany} disabled={creatingRecords || !userId}>
              {creatingRecords ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Profile & Company"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Step 4: Test Auth Check</CardTitle>
            <CardDescription>Verify that the auth check API now works</CardDescription>
          </CardHeader>
          <CardContent>
            {testingAuth ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Testing auth check...</span>
              </div>
            ) : authCheckResult ? (
              <div className="space-y-4">
                {authCheckResult.error ? (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{authCheckResult.error}</AlertDescription>
                  </Alert>
                ) : authCheckResult.ok ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Success (Status {authCheckResult.status})</AlertTitle>
                    <AlertDescription>
                      <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs">
                        {JSON.stringify(authCheckResult.data, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle>Failed (Status {authCheckResult.status})</AlertTitle>
                    <AlertDescription>
                      <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto text-xs">
                        {JSON.stringify(authCheckResult.data, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Click the button below to test the auth check API.</div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testAuthCheck} disabled={testingAuth}>
              {testingAuth ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Auth Check"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>What to do after fixing your account</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Complete all steps above in order</li>
              <li>Make sure the "Test Auth Check" returns a successful response</li>
              <li>
                Go back to the{" "}
                <a href="/" className="text-blue-600 hover:underline">
                  main dashboard
                </a>
              </li>
              <li>If you still see "Company Setup Required", try refreshing the page</li>
              <li>If issues persist, check the browser console for errors</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
