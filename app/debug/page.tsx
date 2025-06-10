"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function DebugPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        console.log("Session:", session)
        console.log("Session error:", sessionError)
        setSession(session)

        if (session?.user) {
          // Get profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()

          console.log("Profile:", profile)
          console.log("Profile error:", profileError)
          setProfile(profile)
        }
      } catch (error) {
        console.error("Debug error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Session Status:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
          </div>

          <div>
            <h3 className="font-medium">Profile Data:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
