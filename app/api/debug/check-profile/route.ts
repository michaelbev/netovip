import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: userError?.message || "No authenticated user found",
          status: "unauthenticated",
        },
        { status: 401 },
      )
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      return NextResponse.json(
        {
          error: profileError.message,
          status: "error",
        },
        { status: 500 },
      )
    }

    if (!profile) {
      return NextResponse.json({
        exists: false,
        userId: user.id,
        email: user.email,
        message: "No profile found for this user",
      })
    }

    // Check if company exists
    let company = null
    let companyError = null

    if (profile.company_id) {
      const companyResult = await supabase.from("companies").select("*").eq("id", profile.company_id).single()

      company = companyResult.data
      companyError = companyResult.error
    }

    return NextResponse.json({
      exists: true,
      profile,
      hasCompany: !!profile.company_id,
      company,
      companyError: companyError?.message,
      userId: user.id,
      email: user.email,
    })
  } catch (error: any) {
    console.error("Error checking profile:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error checking profile",
        status: "error",
      },
      { status: 500 },
    )
  }
}
