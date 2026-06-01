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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--cream)" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mx-auto mb-3"
            style={{
              background: "var(--navy-900)",
              color: "var(--gold-500)",
              fontFamily: "'Playfair Display', serif"
            }}
          >
            U
          </div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Loading UniArena...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen" style={{ background: "var(--cream)" }}>
      <Sidebar />
      <Navbar />
      <main
        className="bg-[#F8F7F4]"
        style={{
          marginLeft: 240,
          paddingTop: 60,
          minHeight: "100vh"
        }}
      >
        <div className="bg-[#F8F7F4]" style={{ minHeight: "100vh" }}>
          {children}
        </div>
      </main>
    </div>
  )
}