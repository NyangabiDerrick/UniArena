"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { Bell, Calendar, Users, Newspaper, Trophy, CheckCircle } from "lucide-react"
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
  type AppNotification
} from "@/lib/notificationsApi"

const icons: Record<string, { Icon: typeof Bell; bg: string; color: string }> = {
  club: { Icon: Users, bg: "#EFF6FF", color: "#1D4ED8" },
  event: { Icon: Calendar, bg: "#FFF7ED", color: "#C2410C" },
  news: { Icon: Newspaper, bg: "#F5F3FF", color: "#6D28D9" },
  sports: { Icon: Trophy, bg: "#F0FDF4", color: "#15803D" },
  default: { Icon: CheckCircle, bg: "#F3F4F6", color: "#475569" }
}

const ago = (d: string) => {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function NotificationsPage() {
  const router = useRouter()
  const { status } = useSession()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status !== "authenticated") return
    getNotifications()
      .then(d => setItems(d.items))
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load notifications"))
      .finally(() => setLoading(false))
  }, [status])

  const unread = items.filter(n => !n.isRead).length

  const open = async (n: AppNotification) => {
    if (!n.isRead) {
      setItems(prev => prev.map(x => (x.id === n.id ? { ...x, isRead: true } : x)))
      markNotificationRead(n.id).catch(() => {})
    }
    if (n.link) router.push(n.link)
  }

  const readAll = async () => {
    setItems(prev => prev.map(x => ({ ...x, isRead: true })))
    markAllNotificationsRead().catch(() => {})
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>Notifications</h1>
            <p style={{ fontSize: 14, color: "#6B6962" }}>
              {unread > 0 ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={readAll} style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "'Inter', sans-serif" }}>
              Mark all as read
            </button>
          )}
        </div>

        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        {loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : items.length === 0 ? (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 56, textAlign: "center" }}>
            <Bell size={36} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "#6B6962" }}>No notifications yet. They appear when something happens with your clubs and events.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(n => {
              const { Icon, bg, color } = icons[n.type] || icons.default
              return (
                <div key={n.id} onClick={() => open(n)} style={{
                  display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 20px", borderRadius: 14, cursor: "pointer",
                  background: n.isRead ? "white" : "#FFFBF0",
                  border: n.isRead ? "1px solid #E4E2DC" : "1.5px solid #E8D89A"
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{n.title}</p>
                      {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9A84C", flexShrink: 0, marginTop: 4 }} />}
                    </div>
                    <p style={{ fontSize: 13, color: "#6B6962", marginTop: 3, lineHeight: 1.5 }}>{n.message}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>{ago(n.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}