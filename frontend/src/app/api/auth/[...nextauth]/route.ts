import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// The API token has its own secret. It falls back to the NextAuth secret for older setups.
const apiSecret = () => process.env.API_JWT_SECRET || process.env.NEXTAUTH_SECRET!

// The API sees every sign-in as coming from this server. Forwarding the visitor's address (signed, so it
// cannot be faked) lets it count failed attempts per visitor instead of per server.
const clientIpHeaders = (headers: Record<string, unknown> | undefined): Record<string, string> => {
  const forwarded = headers?.["x-forwarded-for"]
  const ip = String(Array.isArray(forwarded) ? forwarded[0] : forwarded ?? "").split(",")[0].trim()
  if (!ip) return {}
  const sig = crypto.createHmac("sha256", apiSecret()).update(`client-ip:${ip}`).digest("hex")
  return { "x-client-ip": ip, "x-client-ip-sig": sig }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "University account",
      credentials: {
        email: { label: "University Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        let res: Response
        try {
          res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...clientIpHeaders(req?.headers as Record<string, unknown> | undefined) },
            body: JSON.stringify({ email: credentials.email, password: credentials.password })
          })
        } catch {
          throw new Error("Cannot reach the server. Please try again.")
        }

        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || "Invalid email or password")
        return data.data
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.studentId = user.studentId
        token.faculty = user.faculty
        // When this sign-in began. A password reset ends every sign-in that began before it.
        token.sid = Math.floor(Date.now() / 1000)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.studentId = token.studentId as string
        session.user.faculty = token.faculty as string
      }
      session.accessToken = jwt.sign(
        { email: token.email, role: token.role, studentId: token.studentId, sid: token.sid ?? token.iat },
        apiSecret(),
        { expiresIn: "1h", algorithm: "HS256", issuer: "uniarena-web", audience: "uniarena-api" }
      )
      return session
    }
  },
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }