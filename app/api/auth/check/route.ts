import { createClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Not authenticated",
        },
        { status: 401 },
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        companies:company_id(
          id,
          name,
          email
        )
      `)
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)

      // If profile doesn't exist, create one
      if (profileError.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            role: "operator",
          })
          .select()
          .single()

        if (createError) {
          return NextResponse.json({
            authenticated: true,
            user: user,
            profile: null,
            needsSetup: true,
            error: "Failed to create profile",
          })
        }

        return NextResponse.json({
          authenticated: true,
          user: user,
          profile: newProfile,
          needsSetup: true,
        })
      }

      return NextResponse.json({
        authenticated: true,
        user: user,
        profile: null,
        needsSetup: true,
        error: profileError.message,
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: user,
      profile: profile,
      needsSetup: !profile.company_id,
    })
  } catch (error: any) {
    console.error("Auth check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
