"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ApiDebugPage() {
  const [authResult, setAuthResult] = useState<any>(null)
  const [revenueResult, setRevenueResult] = useState<any>(null)
  const [wellsResult, setWellsResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAuth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/auth")
      const data = await response.json()
      setAuthResult({ status: response.status, data })
    } catch (error) {
      setAuthResult({ error: error.message })
    }
    setLoading(false)
  }

  const testRevenue = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/revenue")
      const data = await response.json()
      setRevenueResult({ status: response.status, data })
    } catch (error) {
      setRevenueResult({ error: error.message })
    }
    setLoading(false)
  }

  const testWells = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/wells")
      const data = await response.json()
      setWellsResult({ status: response.status, data })
    } catch (error) {
      setWellsResult({ error: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>API Debug Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testAuth} disabled={loading}>
              Test Auth
            </Button>
            <Button onClick={testRevenue} disabled={loading}>
              Test Revenue API
            </Button>
            <Button onClick={testWells} disabled={loading}>
              Test Wells API
            </Button>
          </div>

          {authResult && (
            <div>
              <h3 className="font-medium mb-2">Auth Debug Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(authResult, null, 2)}</pre>
            </div>
          )}

          {revenueResult && (
            <div>
              <h3 className="font-medium mb-2">Revenue API Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(revenueResult, null, 2)}
              </pre>
            </div>
          )}

          {wellsResult && (
            <div>
              <h3 className="font-medium mb-2">Wells API Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(wellsResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
