"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Building2, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"
import { api } from "@/lib/api"

const activity = [
  { action:"Club request submitted", detail:"Photography Society by John Student", time:"2 minutes ago", type:"pending" },
  { action:"Event approved", detail:"Annual Sports Day by Sarah Admin", time:"1 hour ago", type:"approved" },
  { action:"User suspended", detail:"Account violation — user@university.ac", time:"3 hours ago", type:"rejected" },
  { action:"Club approved", detail:"Debate Society now active", time:"Yesterday", type:"approved" },
  { action:"New user registered", detail:"newstudent@university.ac joined", time:"Yesterday", type:"pending" },
]

const quickActions = [
  { label:"Manage Users", desc:"View, suspend, change roles", href:"/admin/users", icon:Users, bg:"#EFF6FF", color:"#1D4ED8" },
  { label:"Approval Queue", desc:"Items pending review", href:"/admin/approvals", icon:AlertCircle, bg:"#FFF7ED", color:"#C2410C" },
  { label:"Audit Logs", desc:"View all admin actions", href:"/admin/audit", icon:Clock, bg:"#F5F3FF", color:"#6D28D9" },
]

function StatusDot({ type }: { type: string }) {
  const color = type === "approved" ? "#16A34A" : type === "rejected" ? "#DC2626" : "#D97706"
  const Icon = type === "approved" ? CheckCircle : type === "rejected" ? XCircle : Clock
  return <Icon size={15} color={color} style={{ flexShrink: 0 }} />
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0, totalClubs: 0, totalEvents: 0, pendingApprovals: 0
  })

  useEffect(() => {
    api.getAdminAnalytics()
      .then(res => setAnalytics(res.data))
      .catch(err => console.error('Failed to fetch analytics:', err))
  }, [])

  const stats = [
    { label:"Total Users", value: String(analytics.totalUsers), sub:"Registered users", icon:Users, bg:"#EFF6FF", color:"#1D4ED8" },
    { label:"Active Clubs", value: String(analytics.totalClubs), sub:"Approved clubs", icon:Building2, bg:"#F0FDF4", color:"#15803D" },
    { label:"Upcoming Events", value: String(analytics.totalEvents), sub:"Approved events", icon:Calendar, bg:"#FFF7ED", color:"#C2410C" },
    { label:"Pending Approvals", value: String(analytics.pendingApprovals), sub:"Needs attention", icon:AlertCircle, bg:"#FEF2F2", color:"#DC2626" },
  ]

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 14, color: "#6B6962" }}>Platform overview and management</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} style={{
              background: "white", borderRadius: 14, padding: "22px",
              border: "1px solid #E4E2DC"
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: s.bg, display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 14
              }}>
                <Icon size={18} color={s.color} />
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#0B1D3A", lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A", margin: "4px 0 2px" }}>{s.label}</p>
              <p style={{ fontSize: 11, color: "#9CA3AF" }}>{s.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Recent Activity */}
        <div style={{ background: "white", borderRadius: 14, padding: "22px", border: "1px solid #E4E2DC" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 16 }}>
            Recent Activity
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {activity.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 0",
                borderBottom: i < activity.length - 1 ? "1px solid #F3F4F6" : "none"
              }}>
                <StatusDot type={item.type} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{item.action}</p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{item.detail}</p>
                </div>
                <span style={{ fontSize: 11, color: "#9CA3AF", whiteSpace: "nowrap" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: "white", borderRadius: 14, padding: "22px", border: "1px solid #E4E2DC" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 16 }}>
            Quick Actions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {quickActions.map(action => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", borderRadius: 10, textDecoration: "none",
                  border: "1px solid #F3F4F6", transition: "border-color 0.15s, background 0.15s"
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "#FAFAFA"
                    el.style.borderColor = "#E4E2DC"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.background = "transparent"
                    el.style.borderColor = "#F3F4F6"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: action.bg, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Icon size={16} color={action.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{action.label}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF" }}>{action.desc}</p>
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