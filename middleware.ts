import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const referer = request.headers.get("referer")

  const hostname = request.headers.get("host")

  const authorization = request.headers.get("Authorization")

  if (authorization && authorization === process.env.SECRET) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith("/api")) {
    if (!referer || !referer.includes(hostname!)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Unauthorized: External API calls are not allowed",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/api/:path*",
}
