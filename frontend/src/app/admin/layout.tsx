"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role
      if (role !== "ADMIN" && role !== "MODERATOR") {
        router.push("/dashboard")
      }
    }
  }, [status, session, router])

  if (status === "loading") return null

  return <MainLayout>{children}</MainLayout>
}