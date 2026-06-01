"use client"

import { signOut, useSession } from "next-auth/react"
import { Bell, LogOut, User } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <header
      className="bg-[#F8F7F4]/95"
      style={{
        position: "fixed",
        top: 0,
        left: 240,
        right: 0,
        height: 60,
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #E4E2DC",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        zIndex: 30
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 3, height: 18,
          backgroundColor: "#C9A84C",
          borderRadius: 2
        }} />
        <span style={{ fontSize: 13, color: "#6B6962" }}>
          Welcome back,{" "}
          <span style={{ fontWeight: 600, color: "#0B1D3A" }}>
            {session?.user?.name?.split(" ")[0]}
          </span>
        </span>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Link
          href="/notifications"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 8,
            color: "#6B6962", textDecoration: "none",
            position: "relative", transition: "background 0.15s",
            backgroundColor: "transparent"
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(11,29,58,0.07)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
        >
          <Bell size={17} />
          <div style={{
            position: "absolute", top: 8, right: 8,
            width: 6, height: 6, borderRadius: "50%",
            backgroundColor: "#C9A84C"
          }} />
        </Link>

        <Link
          href="/profile"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 8,
            color: "#6B6962", textDecoration: "none",
            backgroundColor: "transparent", transition: "background 0.15s"
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(11,29,58,0.07)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
        >
          <User size={17} />
        </Link>

        <div style={{ width: 1, height: 18, backgroundColor: "#E4E2DC", margin: "0 4px" }} />

        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 8,
            border: "none", cursor: "pointer",
            backgroundColor: "transparent",
            color: "#DC2626", fontSize: 13, fontWeight: 500,
            transition: "background 0.15s",
            fontFamily: "'Inter', sans-serif"
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#FEF2F2"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </header>
  )
}