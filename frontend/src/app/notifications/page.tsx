"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Bell, CheckCircle, Calendar, Users, Newspaper, Trophy } from "lucide-react"

const mockNotifications = [
  { id:"1", title:"Membership request approved", message:"Your request to join Photography Society has been approved.", type:"club", isRead:false, time:"2 minutes ago", icon:Users, iconBg:"#EFF6FF", iconColor:"#1D4ED8" },
  { id:"2", title:"Event reminder", message:"Annual Sports Day is tomorrow at 9:00 AM at the Main Stadium.", type:"event", isRead:false, time:"1 hour ago", icon:Calendar, iconBg:"#FFF7ED", iconColor:"#C2410C" },
  { id:"3", title:"New article published", message:"Photography Society posted: Our members won 3 awards at the National Competition.", type:"news", isRead:false, time:"3 hours ago", icon:Newspaper, iconBg:"#F5F3FF", iconColor:"#6D28D9" },
  { id:"4", title:"Match result posted", message:"UniArena FC won 3-1 against City University in the National Championship Final.", type:"sports", isRead:true, time:"Yesterday", icon:Trophy, iconBg:"#F0FDF4", iconColor:"#15803D" },
  { id:"5", title:"Ticket confirmed", message:"Your RSVP for Annual Sports Day has been confirmed. Check your email for the QR code.", type:"event", isRead:true, time:"2 days ago", icon:CheckCircle, iconBg:"#F0FDF4", iconColor:"#15803D" },
]

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(mockNotifications)
  const unread = notifs.filter(n => !n.isRead).length

  return (
    <MainLayout>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
              Notifications
            </h1>
            <p style={{ fontSize: 14, color: "#6B6962" }}>
              {unread > 0 ? `${unread} unread notification${unread !== 1 ? "s" : ""}` : "All caught up ✓"}
            </p>
          </div>
          {unread > 0 && (
            <button onClick={() => setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))} style={{
              fontSize: 13, fontWeight: 500, color: "#0B1D3A",
              background: "none", border: "none", cursor: "pointer", textDecoration: "underline",
              fontFamily: "'Inter', sans-serif"
            }}>Mark all as read</button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map(n => {
            const Icon = n.icon
            return (
              <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))} style={{
                display: "flex", alignItems: "flex-start", gap: 16,
                padding: "16px 20px", borderRadius: 14,
                background: n.isRead ? "white" : "#FFFBF0",
                border: n.isRead ? "1px solid #E4E2DC" : "1.5px solid #E8D89A",
                cursor: "pointer", transition: "box-shadow 0.2s"
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(11,29,58,0.08)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: n.iconBg, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Icon size={18} color={n.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{n.title}</p>
                    {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9A84C", flexShrink: 0, marginTop: 4 }} />}
                  </div>
                  <p style={{ fontSize: 13, color: "#6B6962", marginTop: 3, lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>{n.time}</p>
                </div>
              </div>
            )
          })}
        </div>

        {notifs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Bell size={40} color="#D1D5DB" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "#6B6962" }}>No notifications yet</p>
          </div>
        )}

      </div>
    </MainLayout>
  )
}