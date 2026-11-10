"use client"

import { useState, useEffect, useCallback } from "react"
import { signOut, useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, Bell, LogOut, User, MessageSquare, MailWarning, Menu } from "lucide-react"
import Link from "next/link"
import { getCounts } from "@/lib/countsApi"
import { resendVerification } from "@/lib/verifyApi"
import { usePolling } from "@/lib/usePolling"

const badge: React.CSSProperties = {
  position: "absolute", top: 3, right: 1, minWidth: 16, height: 16, padding: "0 4px",
  borderRadius: 99, backgroundColor: "#C9A84C", color: "#0B1D3A",
  fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center"
}

export default function Navbar({ onMenu }: { onMenu?: () => void }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [unread, setUnread] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [verified, setVerified] = useState(true)
  const [mailNote, setMailNote] = useState("")
  const [sending, setSending] = useState(false)

  const refresh = useCallback(() => {
    getCounts()
      .then(c => {
        setUnread(c.notifications)
        setUnreadMessages(c.messages)
        setVerified(c.emailVerified)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (status === "authenticated") refresh()
  }, [status, pathname, refresh])
  usePolling(refresh, 30000, status === "authenticated")

  const goBack = () => {
    if (window.history.length > 1) router.back()
    else router.push("/dashboard")
  }

  const resend = async () => {
    setSending(true)
    setMailNote("")
    try {
      setMailNote(await resendVerification())
    } catch (e) {
      setMailNote(e instanceof Error ? e.message : "Could not send the email")
    } finally {
      setSending(false)
    }
  }

  const iconLink: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 36, height: 36, borderRadius: 8, color: "#6B6962",
    textDecoration: "none", position: "relative", flexShrink: 0
  }

  return (
    <header
      className="app-navbar"
      style={{
        position: "fixed", top: 0, left: 240, right: 0, height: 60,
        backgroundColor: "rgba(248,247,244,0.95)",
        backdropFilter: "blur(8px)", borderBottom: "1px solid #E4E2DC",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", zIndex: 30
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <button
          className="app-menu-btn"
          onClick={onMenu}
          aria-label="Open menu"
          style={{
            alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 8, border: "1.5px solid #E4E2DC",
            background: "white", color: "#0B1D3A", cursor: "pointer", flexShrink: 0
          }}
        >
          <Menu size={18} />
        </button>
        {pathname !== "/dashboard" && (
          <button
            onClick={goBack}
            aria-label="Go back"
            title="Back"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: 8, border: "1.5px solid #E4E2DC",
              background: "white", color: "#0B1D3A", cursor: "pointer", flexShrink: 0
            }}
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="app-hide-mobile" style={{ width: 3, height: 18, backgroundColor: "#C9A84C", borderRadius: 2 }} />
        <span className="app-hide-mobile" style={{ fontSize: 13, color: "#6B6962" }}>
          Welcome back,{" "}
          <span style={{ fontWeight: 600, color: "#0B1D3A" }}>{session?.user?.name?.split(" ")[0]}</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {!verified && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
            {mailNote && <span className="app-hide-mobile" style={{ fontSize: 12, color: "#6B6962", maxWidth: 260 }}>{mailNote}</span>}
            <button
              onClick={resend}
              disabled={sending}
              title="Confirm your university email to message, RSVP and join clubs"
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8,
                border: "1.5px solid #C9A84C", background: "#FFFBF0", color: "#92400E",
                fontSize: 12, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif"
              }}
            >
              <MailWarning size={14} />
              <span className="app-hide-mobile">{sending ? "Sending..." : "Confirm your email"}</span>
            </button>
          </div>
        )}

        <Link href="/messages" style={iconLink} aria-label={unreadMessages > 0 ? `${unreadMessages} unread messages` : "Messages"}>
          <MessageSquare size={17} />
          {unreadMessages > 0 && <span style={badge}>{unreadMessages > 9 ? "9+" : unreadMessages}</span>}
        </Link>

        <Link href="/notifications" style={iconLink} aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}>
          <Bell size={17} />
          {unread > 0 && <span style={badge}>{unread > 9 ? "9+" : unread}</span>}
        </Link>

        <Link href="/profile" style={iconLink} aria-label="Profile">
          <User size={17} />
        </Link>

        <div className="app-hide-mobile" style={{ width: 1, height: 18, backgroundColor: "#E4E2DC", margin: "0 4px" }} />

        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          aria-label="Sign out"
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8,
            border: "none", cursor: "pointer", backgroundColor: "transparent",
            color: "#DC2626", fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif"
          }}
        >
          <LogOut size={15} />
          <span className="app-hide-mobile">Sign out</span>
        </button>
      </div>
    </header>
  )
}