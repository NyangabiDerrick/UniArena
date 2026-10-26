import "next-auth"

declare module "next-auth" {
  interface User {
    role: string
    studentId: string
    faculty: string
  }

  interface Session {
    accessToken: string
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      studentId: string
      faculty: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    studentId: string
    faculty: string
  }
}