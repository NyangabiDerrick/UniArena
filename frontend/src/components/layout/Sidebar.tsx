"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  LayoutDashboard, Users, Trophy, Calendar, Ticket,
  Newspaper, MessageSquare, Shield, Settings, Flag, Scale,
  CalendarPlus, CalendarCheck, FilePlus, FileText, Building2, ClipboardList, ImagePlus, BarChart3
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { api } from "@/lib/api"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: string[]
  needs?: "club" | "team"
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Clubs", href: "/clubs", icon: Users, roles: ["STUDENT","CLUB_LEADER","LECTURER","MODERATOR","ADMIN"] },
  { label: "Manage Club", href: "/clubs/manage", icon: Settings, roles: ["CLUB_LEADER","ADMIN"], needs: "club" },
  { label: "Manage Team", href: "/sports/manage", icon: ClipboardList, roles: ["CLUB_LEADER","ADMIN"], needs: "team" },
  { label: "Group Images", href: "/clubs/manage/images", icon: ImagePlus, roles: ["CLUB_LEADER","ADMIN"] },
  { label: "Create Event", href: "/clubs/manage/create-event", icon: CalendarPlus, roles: ["CLUB_LEADER","ADMIN"] },
  { label: "Manage Events", href: "/clubs/manage/events", icon: CalendarCheck, roles: ["CLUB_LEADER","ADMIN"] },
  { label: "Post News", href: "/clubs/manage/post-news", icon: FilePlus, roles: ["CLUB_LEADER","ADMIN"] },
  { label: "Manage News", href: "/clubs/manage/news", icon: FileText, roles: ["CLUB_LEADER","ADMIN"] },
  { label: "Sports", href: "/sports", icon: Trophy, roles: ["STUDENT","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Events", href: "/events", icon: Calendar, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "My Tickets", href: "/tickets", icon: Ticket, roles: ["STUDENT","CLUB_LEADER","ADMIN"] },
  { label: "News", href: "/news", icon: Newspaper, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Messages", href: "/messages", icon: MessageSquare, roles: ["STUDENT","CLUB_LEADER","SPORTS_CAPTAIN","LECTURER","MODERATOR","ADMIN"] },
  { label: "Admin", href: "/admin", icon: Shield, roles: ["ADMIN","MODERATOR"] },
  { label: "Groups", href: "/admin/groups", icon: Building2, roles: ["ADMIN"] },
  { label: "Group Insights", href: "/admin/insights", icon: BarChart3, roles: ["ADMIN"] },
  { label: "Reports", href: "/admin/reports", icon: Flag, roles: ["ADMIN","MODERATOR"] },
  { label: "Appeals", href: "/admin/appeals", icon: Scale, roles: ["ADMIN"] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const userRole = session?.user?.role || "STUDENT"
  const [leads, setLeads] = useState<{ club: boolean; team: boolean } | null>(null)

  // A leader's current group comes from the database, so it is right even just after an assignment
  useEffect(() => {
    if (status !== "authenticated" || userRole !== "CLUB_LEADER") return
    let cancelled = false
    api.getProfile()
      .then(res => {
        if (!cancelled) setLeads({ club: !!res.data.managedClub, team: !!res.data.managedTeam })
      })
      .catch(() => { if (!cancelled) setLeads({ club: true, team: true }) })
    return () => { cancelled = true }
  }, [status, userRole])

  const visible = navItems.filter(item => {
    if (!item.roles.includes(userRole)) return false
    if (item.needs && userRole === "CLUB_LEADER") {
      if (!leads) return false
      return item.needs === "club" ? leads.club : leads.team
    }
    return true
  })

  // The most specific matching item is the active one
  const activeHref = visible
    .filter(i => pathname === i.href || pathname.startsWith(i.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

  return (
    <aside
      className="bg-[#0B1D3A]"
      style={{
        position: "fixed", left: 0, top: 0, width: 240, height: "100vh",
        display: "flex", flexDirection: "column", zIndex: 40,
        borderRight: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <div style={{ height: 3, backgroundColor: "#C9A84C", flexShrink: 0 }} />

      <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, backgroundColor: "#C9A84C", color: "#0B1D3A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, flexShrink: 0
          }}>U</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "#FFFFFF", lineHeight: 1 }}>UniArena</div>
            <div style={{ fontSize: 9, color: "#C9A84C", letterSpacing: "0.12em", marginTop: 3, opacity: 0.85 }}>UNIVERSITY PLATFORM</div>
          </div>
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        {visible.map(item => {
          const Icon = item.icon
          const isActive = item.href === activeHref
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "all 0.15s",
                backgroundColor: isActive ? "rgba(201,168,76,0.13)" : "transparent",
                color: isActive ? "#E2C06E" : "rgba(255,255,255,0.5)",
                borderLeft: isActive ? "2px solid #C9A84C" : "2px solid transparent"
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: "10px 10px 14px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, backgroundColor: "rgba(255,255,255,0.05)" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, backgroundColor: "#1E3560", color: "#C9A84C",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0
          }}>
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session?.user?.name}
            </div>
            <div style={{ fontSize: 10, color: "#C9A84C", opacity: 0.8, marginTop: 1 }}>
              {session?.user?.role === "CLUB_LEADER" ? "Leader" : session?.user?.role === "ADMIN" ? "Admin" : "Student"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}                           