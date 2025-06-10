import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
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

    // Check if profile already exists
    const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Create company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert([
        {
          name: "My Oil & Gas Company",
          created_by: user.id,
          status: "active",
          company_type: "operator",
          address: "123 Main St",
          city: "Houston",
          state: "TX",
          zip: "77001",
          phone: "555-123-4567",
          email: user.email || "contact@myoilgascompany.com",
        },
      ])
      .select()
      .single()

    if (companyError) {
      return NextResponse.json(
        {
          error: `Error creating company: ${companyError.message}`,
          status: "error",
        },
        { status: 500 },
      )
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
        .eq("id", user.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          {
            error: `Error updating profile: ${updateError.message}`,
            status: "error",
          },
          { status: 500 },
        )
      }

      profileResult = updatedProfile
    } else {
      // Create new profile
      const { data: newProfile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: user.id,
            company_id: company.id,
            role: "admin",
            first_name: "User",
            last_name: "Account",
            email: user.email || "",
            status: "active",
          },
        ])
        .select()
        .single()

      if (profileError) {
        return NextResponse.json(
          {
            error: `Error creating profile: ${profileError.message}`,
            status: "error",
          },
          { status: 500 },
        )
      }

      profileResult = newProfile
    }

    // Create user_companies association
    const { error: userCompanyError } = await supabase.from("user_companies").insert([
      {
        user_id: user.id,
        company_id: company.id,
        role: "admin",
        status: "active",
      },
    ])

    if (userCompanyError) {
      return NextResponse.json({
        warning: `Profile and company created, but error creating user_companies association: ${userCompanyError.message}`,
        profile: profileResult,
        company,
        status: "partial_success",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully created profile and company association!",
      profile: profileResult,
      company,
    })
  } catch (error: any) {
    console.error("Error creating records:", error)
    return NextResponse.json(
      {
        error: error.message || "Unknown error creating records",
        status: "error",
      },
      { status: 500 },
    )
  }
}
