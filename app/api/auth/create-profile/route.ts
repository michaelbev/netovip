import { createAdminClient } from "@/lib/supabase-admin"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.userId || !body.email || !body.companyId) {
      return NextResponse.json({ error: "User ID, email, and company ID are required" }, { status: 400 })
    }

    console.log("Creating profile for user:", body.userId)

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    if (!adminSupabase) {
      console.error("Failed to create admin client")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    // Create user profile
    const { error: profileError } = await adminSupabase.from("profiles").upsert(
      {
        id: body.userId,
        email: body.email,
        role: body.role || "user",
        company_id: body.companyId,
      },
      {
        onConflict: "id",
      },
    )

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 })
    }

    console.log("Profile created successfully")

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: any) {
    console.error("Profile creation error:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}
