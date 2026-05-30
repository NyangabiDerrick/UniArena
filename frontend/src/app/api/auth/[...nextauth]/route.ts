import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "University SSO",
      credentials: {
        email: { label: "University Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const mockUsers = [
          {
            id: "1",
            email: "student@university.ac",
            name: "John Student",
            role: "STUDENT",
            studentId: "UA-2024-001",
            faculty: "Computer Science"
          },
          {
            id: "2",
            email: "leader@university.ac",
            name: "Jane Leader",
            role: "CLUB_LEADER",
            studentId: "UA-2024-002",
            faculty: "Business"
          },
          {
            id: "3",
            email: "captain@university.ac",
            name: "Mike Captain",
            role: "SPORTS_CAPTAIN",
            studentId: "UA-2024-003",
            faculty: "Sports Science"
          },
          {
            id: "4",
            email: "admin@university.ac",
            name: "Sarah Admin",
            role: "ADMIN",
            studentId: "UA-2024-004",
            faculty: "Administration"
          },
          {
            id: "5",
            email: "lecturer@university.ac",
            name: "Dr. Smith",
            role: "LECTURER",
            studentId: "UA-STAFF-001",
            faculty: "Computer Science"
          }
        ]

        const user = mockUsers.find(u => u.email === credentials?.email)

        if (user && credentials?.password === "password123") {
          return user
        }

        return null
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
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }