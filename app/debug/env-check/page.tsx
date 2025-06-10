"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function EnvCheckPage() {
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkEnvironment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/env-check")
      const data = await response.json()
      setEnvData(data)
    } catch (error) {
      console.error("Error checking environment:", error)
      setEnvData({ error: "Failed to check environment" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Environment Check</h1>
          <p className="text-gray-600">Check if all required environment variables are properly configured</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Check the status of required environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={checkEnvironment} disabled={loading} className="mb-4">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Check Environment
              </Button>

              {envData && (
                <div className="space-y-4">
                  {envData.error ? (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-2" />
                      <span>{envData.error}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(envData.env || {}).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-medium">{key}</span>
                          {value === "Present" ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Present
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>If environment variables are missing, check your .env.local file</li>
                  <li>
                    If all variables are present, try the{" "}
                    <a href="/debug/users" className="underline">
                      Users Debug
                    </a>{" "}
                    page
                  </li>
                  <li>If issues persist, check your Supabase project settings</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
