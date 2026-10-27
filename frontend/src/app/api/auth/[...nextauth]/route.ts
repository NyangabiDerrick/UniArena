import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import jwt from "jsonwebtoken"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "University account",
      credentials: {
        email: { label: "University Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        let res: Response
        try {
          res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
        { email: token.email, role: token.role, studentId: token.studentId },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: "1h" }
      )
      return session
    }
  },
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }