"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, RefreshCw, UserPlus, AlertCircle, CheckCircle } from "lucide-react"

interface User {
  id: string
  email: string
  created_at: string
  email_confirmed_at: string | null
  last_sign_in_at: string | null
  user_metadata: any
}

interface ApiResponse {
  users: User[]
  total: number
  error?: string
  message?: string
  success?: boolean
  stack?: string
}

export default function DebugUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Fetching users from API...")
      const response = await fetch("/api/debug/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Non-JSON response:", textResponse)
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}...`)
      }

      const data: ApiResponse = await response.json()
      console.log("API Response:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setUsers(data.users || [])
      if (data.message) {
        setSuccess(data.message)
      }
    } catch (err: any) {
      console.error("Error fetching users:", err)
      setError(err.message || "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Creating test user...")
      const response = await fetch("/api/debug/create-test-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "asdfds@asdfads.com",
          password: "ahhahh",
        }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Non-JSON response:", textResponse)
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}...`)
      }

      const data = await response.json()
      console.log("Create user response:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setSuccess("User created successfully! You can now try logging in.")

      // Refresh the users list
      setTimeout(() => {
        fetchUsers()
      }, 1000)
    } catch (err: any) {
      console.error("Error creating user:", err)
      setError(err.message || "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug: System Users</h1>
          <p className="text-gray-600">View and manage users in the authentication system</p>
        </div>

        <div className="grid gap-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Management
              </CardTitle>
              <CardDescription>Actions to manage users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={fetchUsers} disabled={loading} variant="outline">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh Users
                </Button>
                <Button onClick={createTestUser} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User: asdfds@asdfads.com
                </Button>
                <Button asChild variant="outline">
                  <a href="/signup">Go to Signup</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/login">Go to Login</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {success && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <p className="text-sm text-green-700 mt-1">{success}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 cursor-pointer">Show technical details</summary>
                      <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">{error}</pre>
                    </details>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Users ({users.length})</CardTitle>
              <CardDescription>All users currently registered in the authentication system</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && users.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                  <p className="text-gray-600 mb-4">There are no users registered in the system yet.</p>
                  <Button onClick={createTestUser} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Your First User
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{user.email}</h3>
                            {user.email_confirmed_at ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Confirmed
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Unconfirmed
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">User ID:</span> {user.id}
                            </p>
                            <p>
                              <span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleString()}
                            </p>
                            {user.last_sign_in_at && (
                              <p>
                                <span className="font-medium">Last Sign In:</span>{" "}
                                {new Date(user.last_sign_in_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
