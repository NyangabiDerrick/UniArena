"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, Users, Trophy, Calendar,
  Newspaper, Image, MessageSquare, Shield, Settings
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Clubs", href: "/clubs", icon: Users, roles: ["STUDENT","CLUB_LEADER","LECTURER","MODERATOR","ADMIN"] },
  { label: "Manage Club", href: "/clubs/manage", icon: Settings, roles: ["CLUB_LEADER","ADMIN"] },
  { label: "Sports", href: "/sports", icon: Trophy, roles: ["STUDENT","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Events", href: "/events", icon: Calendar, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "News", href: "/news", icon: Newspaper, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Gallery", href: "/gallery", icon: Image, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Messages", href: "/messages", icon: MessageSquare, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Admin", href: "/admin", icon: Shield, roles: ["ADMIN","MODERATOR"] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role || "STUDENT"
  const visible = navItems.filter(i => i.roles.includes(userRole))

  return (
    <aside
      className="bg-[#0B1D3A]"
      style={{
        position: "fixed",
        left: 0, top: 0,
        width: 240,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        borderRight: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      {/* Gold top bar */}
      <div style={{ height: 3, backgroundColor: "#C9A84C", flexShrink: 0 }} />

      {/* Logo */}
      <div style={{
        padding: "18px 18px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0
      }}>
        <Link href="/dashboard" style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 8,
            backgroundColor: "#C9A84C",
            color: "#0B1D3A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: 17,
            flexShrink: 0
          }}>U</div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: 16,
              color: "#FFFFFF",
              lineHeight: 1
            }}>UniArena</div>
            <div style={{
              fontSize: 9,
              color: "#C9A84C",
              letterSpacing: "0.12em",
              marginTop: 3,
              opacity: 0.85
            }}>UNIVERSITY PLATFORM</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: "10px 10px",
        overflowY: "auto"
      }}>
        {visible.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                marginBottom: 2,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 500,
                transition: "all 0.15s",
                backgroundColor: isActive ? "rgba(201,168,76,0.13)" : "transparent",
                color: isActive ? "#E2C06E" : "rgba(255,255,255,0.5)",
                borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div style={{
        padding: "10px 10px 14px",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 8,
          backgroundColor: "rgba(255,255,255,0.05)"
        }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 8,
            backgroundColor: "#1E3560",
            color: "#C9A84C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0
          }}>
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#FFFFFF",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {session?.user?.name}
            </div>
            <div style={{
              fontSize: 10,
              color: "#C9A84C",
              opacity: 0.8,
              marginTop: 1
            }}>
              {session?.user?.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}