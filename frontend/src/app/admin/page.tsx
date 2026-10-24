"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Users, Building2, Calendar, AlertCircle, Clock, ChevronDown } from "lucide-react"
import { api } from "@/lib/api"

const quickActions = [
  { label: "Manage Users", desc: "View, suspend, change roles", href: "/admin/users", icon: Users, bg: "#EFF6FF", color: "#1D4ED8" },
  { label: "Approval Queue", desc: "Items pending review", href: "/admin/approvals", icon: AlertCircle, bg: "#FFF7ED", color: "#C2410C" },
  { label: "Audit Logs", desc: "View all admin actions", href: "/admin/audit", icon: Clock, bg: "#F5F3FF", color: "#6D28D9" },
]

export default function AdminPage() {
  const { status } = useSession()
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalClubs: 0, totalEvents: 0, pendingApprovals: 0 })
  const [logs, setLogs] = useState<any[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "authenticated") return
    api.getAdminAnalytics()
      .then(res => setAnalytics(res.data))
      .catch(err => console.error("Failed to fetch analytics:", err))
    api.getAuditLogs()
      .then(res => setLogs(res.data.slice(0, 8)))
      .catch(err => console.error("Failed to fetch audit logs:", err))
  }, [status])

  const stats = [
    { label: "Total Users", value: analytics.totalUsers, sub: "Registered users", href: "/admin/users", icon: Users, bg: "#EFF6FF", color: "#1D4ED8" },
    { label: "Active Clubs", value: analytics.totalClubs, sub: "Approved clubs", href: "/clubs", icon: Building2, bg: "#F0FDF4", color: "#15803D" },
    { label: "Upcoming Events", value: analytics.totalEvents, sub: "Approved events", href: "/events", icon: Calendar, bg: "#FFF7ED", color: "#C2410C" },
    { label: "Pending Approvals", value: analytics.pendingApprovals, sub: "Needs attention", href: "/admin/approvals", icon: AlertCircle, bg: "#FEF2F2", color: "#DC2626" },
  ]

  const when = (d: string) =>
    new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "#6B6962" }}>Platform overview and management</p>
      </div>

      {/* Clickable stat tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white", borderRadius: 14, padding: 22, border: "1px solid #E4E2DC",
                cursor: "pointer", transition: "box-shadow 0.2s, transform 0.2s"
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 8px 24px rgba(11,29,58,0.10)"; el.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "translateY(0)" }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <Icon size={18} color={s.color} />
                </div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#0B1D3A", lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A", margin: "4px 0 2px" }}>{s.label}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF" }}>{s.sub}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent activity from the audit log */}
        <div style={{ background: "white", borderRadius: 14, padding: 22, border: "1px solid #E4E2DC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A" }}>Recent Activity</h2>
            <Link href="/admin/audit" style={{ fontSize: 12, color: "#0B1D3A", textDecoration: "underline" }}>View all</Link>
          </div>

          {logs.length === 0 ? (
            <p style={{ fontSize: 13, color: "#6B6962", padding: "16px 0" }}>
              No admin activity recorded yet. Approvals, role changes and suspensions will appear here.
            </p>
          ) : logs.map((log, i) => {
            const open = openId === log.id
            return (
              <div key={log.id} style={{ borderBottom: i < logs.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <button onClick={() => setOpenId(open ? null : log.id)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "'Inter', sans-serif"
                }}>
                  <Clock size={15} color="#D97706" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{log.action}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{log.admin?.name} · {when(log.createdAt)}</p>
                  </div>
                  <ChevronDown size={15} color="#9CA3AF" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>
                {open && (
                  <div style={{ background: "#F8F7F4", borderRadius: 8, padding: "12px 14px", marginBottom: 12, fontSize: 12, color: "#374151", lineHeight: 1.8 }}>
                    <div><strong>Done by:</strong> {log.admin?.name} ({log.admin?.email})</div>
                    <div><strong>Affected:</strong> {log.targetType} · {log.targetId}</div>
                    {log.details && <div><strong>Details:</strong> {log.details}</div>}
                    <div><strong>When:</strong> {when(log.createdAt)}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div style={{ background: "white", borderRadius: 14, padding: 22, border: "1px solid #E4E2DC" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map(a => {
              const Icon = a.icon
              return (
                <Link key={a.href} href={a.href} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 10, textDecoration: "none", border: "1px solid #F3F4F6"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} color={a.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{a.label}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF" }}>{a.desc}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: "#9CA3AF" }}>›</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}