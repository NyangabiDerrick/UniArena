"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="bg-[#F8F7F4]" style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center"
      }}>
        <p style={{ color: "#6B6962", fontSize: 14 }}>Loading UniArena...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="bg-[#F8F7F4]" style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Navbar />
      <main
        className="bg-[#F8F7F4]"
        style={{
          marginLeft: 240, paddingTop: 60, minHeight: "100vh",
          display: "flex", flexDirection: "column"
        }}
      >
        <div style={{ padding: 32, flex: 1 }}>{children}</div>
        <footer style={{
          padding: "18px 32px",
          borderTop: "1px solid #E4E2DC",
          fontSize: 12, color: "#9CA3AF", textAlign: "center"
        }}>
          © 2026 Nyangabi Derrick. UniArena. All rights reserved.
        </footer>
      </main>
    </div>
  )
}