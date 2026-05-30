"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="text-4xl">🏟️</span>
          <p className="mt-2 text-gray-500 text-sm">Loading UniArena...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      <main className="ml-64 pt-16 p-6 min-h-screen">
        {children}
      </main>
    </div>
  )
}