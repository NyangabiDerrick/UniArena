import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Pages that need a signed-in person. The API still checks every permission itself;
// this only keeps visitors from downloading and flashing pages they cannot use.
const SIGNED_IN = ["/dashboard", "/profile", "/messages", "/notifications", "/tickets", "/clubs/manage", "/admin"]
const ADMIN_ROLES = ["ADMIN", "MODERATOR"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (!SIGNED_IN.some(p => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next()

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const login = new URL("/auth/login", request.url)
    login.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(login)
  }

  if (pathname.startsWith("/admin") && !ADMIN_ROLES.includes(String(token.role))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/messages/:path*", "/notifications/:path*", "/tickets/:path*", "/clubs/manage/:path*", "/admin/:path*"]
}
