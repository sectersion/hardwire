import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedPaths = ["/dashboard", "/onboarding", "/admin"]
const authPaths = ["/api/auth"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.cookies.get("sessionId")?.value

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isAuthApi = authPaths.some((p) => pathname.startsWith(p))

  if (isAuthApi) {
    return NextResponse.next()
  }

  if (isProtected && !sessionId) {
    const loginUrl = new URL("/", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/admin/:path*"],
}
