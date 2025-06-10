import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const results = []

    // Environment Variables Check
    const envChecks = []
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    envChecks.push({
      name: "NEXT_PUBLIC_SUPABASE_URL",
      status: supabaseUrl ? "pass" : "fail",
      message: supabaseUrl ? `Set: ${supabaseUrl.substring(0, 30)}...` : "Missing environment variable",
      details: supabaseUrl || "Not set",
    })

    envChecks.push({
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      status: anonKey ? "pass" : "fail",
      message: anonKey ? `Set: ${anonKey.substring(0, 20)}...` : "Missing environment variable",
      details: anonKey ? `${anonKey.substring(0, 50)}...` : "Not set",
    })

    envChecks.push({
      name: "SUPABASE_SERVICE_ROLE_KEY",
      status: serviceRoleKey ? "pass" : "fail",
      message: serviceRoleKey ? `Set: ${serviceRoleKey.substring(0, 20)}...` : "Missing environment variable",
      details: serviceRoleKey ? `${serviceRoleKey.substring(0, 50)}...` : "Not set",
    })

    results.push({
      category: "Environment",
      checks: envChecks,
    })

    // Supabase Connection Check
    if (supabaseUrl && anonKey) {
      const connectionChecks = []

      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(supabaseUrl, anonKey)

        // Test basic connection
        const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })

        if (error) {
          connectionChecks.push({
            name: "Database Connection",
            status: "fail",
            message: `Connection failed: ${error.message}`,
            details: JSON.stringify(error, null, 2),
          })
        } else {
          connectionChecks.push({
            name: "Database Connection",
            status: "pass",
            message: "Successfully connected to Supabase",
            details: `Profiles table accessible`,
          })
        }
      } catch (error: any) {
        connectionChecks.push({
          name: "Supabase Client",
          status: "fail",
          message: `Failed to create client: ${error.message}`,
          details: error.stack,
        })
      }

      results.push({
        category: "Database",
        checks: connectionChecks,
      })
    }

    // Authentication Settings Check
    if (supabaseUrl && serviceRoleKey) {
      const authChecks = []

      try {
        const { createClient } = await import("@supabase/supabase-js")
        const adminClient = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })

        // Check if we can access auth admin functions
        const { data: users, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 })

        if (error) {
          authChecks.push({
            name: "Admin Access",
            status: "fail",
            message: `Admin access failed: ${error.message}`,
            details: JSON.stringify(error, null, 2),
          })
        } else {
          authChecks.push({
            name: "Admin Access",
            status: "pass",
            message: "Admin client working correctly",
            details: `Found ${users.users?.length || 0} users`,
          })
        }
      } catch (error: any) {
        authChecks.push({
          name: "Admin Client",
          status: "fail",
          message: `Failed to create admin client: ${error.message}`,
          details: error.stack,
        })
      }

      results.push({
        category: "Authentication",
        checks: authChecks,
      })
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: `Diagnostic failed: ${error.message}`,
      details: error.stack,
    })
  }
}
