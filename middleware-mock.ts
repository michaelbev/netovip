import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // For demo mode, allow all requests through
  console.log("Demo mode: allowing all requests")

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Set demo headers
  response.headers.set("x-demo-mode", "true")
  response.headers.set("x-user-id", "demo-user-123")
  response.headers.set("x-company-id", "demo-company-123")

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
