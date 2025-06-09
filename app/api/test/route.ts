import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({
      message: "API is working",
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Test endpoint failed",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
