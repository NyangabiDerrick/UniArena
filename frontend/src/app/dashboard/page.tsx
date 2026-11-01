"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { Users, Calendar, Trophy, Ticket, MapPin } from "lucide-react"
import { api } from "@/lib/api"
import type { Article, Club, Dashboard, Event } from "@/lib/types"

const card: React.CSSProperties = { background: "white", borderRadius: 14, border: "1px solid #E4E2DC" }

const when = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status !== "authenticated") return
    api.getDashboard().then(r => setData(r.data)).catch(e => setError(e.message))
  }, [status])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const stats = [
    { label: "My clubs & societies", value: data?.clubs.length ?? 0, sub: data?.pendingRequests ? `${data.pendingRequests} request${data.pendingRequests > 1 ? "s" : ""} pending` : "Groups you belong to", href: "/clubs", icon: Users },
    { label: "My sports teams", value: data?.teams.length ?? 0, sub: "Teams you play for", href: "/sports", icon: Trophy },
    { label: "Upcoming events", value: data?.events.length ?? 0, sub: "From your groups", href: "/events", icon: Calendar },
    { label: "My tickets", value: data?.tickets ?? 0, sub: "Upcoming events", href: "/events", icon: Ticket }
  ]

  const noGroups = data && data.clubs.length === 0 && data.teams.length === 0

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        <div style={{ background: "#0B1D3A", borderRadius: 16, padding: "36px 40px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#C9A84C" }} />
          <p style={{ fontSize: 11, letterSpacing: "0.12em", color: "#C9A84C", marginBottom: 8 }}>{greeting.toUpperCase()}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "white", marginBottom: 14 }}>
            {session?.user?.name?.split(" ")[0]}
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "rgba(201,168,76,0.15)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)" }}>
              {session?.user?.role === "CLUB_LEADER" ? "Leader" : session?.user?.role === "ADMIN" ? "Admin" : "Student"}
            </span>
            {session?.user?.faculty && (
              <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                {session.user.faculty}
              </span>
            )}
          </div>
        </div>

        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {stats.map(s => {
            const Icon = s.icon
            return (
              <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
                <div style={{ ...card, padding: 22, transition: "box-shadow 0.2s, transform 0.2s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 8px 24px rgba(11,29,58,0.10)"; el.style.transform = "translateY(-2px)" }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "translateY(0)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#0B1D3A", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <Icon size={16} color="#C9A84C" />
                  </div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "#0B1D3A", lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A", margin: "4px 0 2px" }}>{s.label}</p>
                  <p style={{ fontSize: 11, color: "#9CA3AF" }}>{s.sub}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {noGroups && (
          <div style={{ ...card, padding: 36, textAlign: "center", marginBottom: 24 }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>🏛️</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 8 }}>You haven&apos;t joined anything yet</h2>
            <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 16 }}>Join a club or society and its events and news will appear here.</p>
            <Link href="/clubs" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 8, background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Browse clubs and societies
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ ...card, padding: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 16 }}>Upcoming events</h2>
            {!data || data.events.length === 0 ? (
              <p style={{ fontSize: 13, color: "#6B6962" }}>No upcoming events from your groups.</p>
            ) : data.events.map((ev: Event) => (
              <Link key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: "none", display: "block", padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#0B1D3A", marginBottom: 4 }}>{ev.title}</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>{when(ev.startsAt)}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{ev.venue}</span>
                  <span>{ev.club?.name || ev.team?.name}</span>
                </p>
              </Link>
            ))}
          </div>

          <div style={{ ...card, padding: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 16 }}>Latest news</h2>
            {!data || data.articles.length === 0 ? (
              <p style={{ fontSize: 13, color: "#6B6962" }}>No news yet.</p>
            ) : data.articles.map((a: Article) => (
              <Link key={a.id} href={`/news/${a.id}`} style={{ textDecoration: "none", display: "block", padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#0B1D3A", marginBottom: 4 }}>{a.title}</p>
                <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {a.club?.name || a.team?.name || "University"} · {when(a.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {data && data.clubs.length > 0 && (
          <div style={{ ...card, padding: 24, marginTop: 20 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 16 }}>My clubs and societies</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {data.clubs.map((c: Club) => (
                <Link key={c.id} href={`/clubs/${c.id}`} style={{ textDecoration: "none", padding: "8px 16px", borderRadius: 99, border: "1.5px solid #E4E2DC", fontSize: 13, color: "#0B1D3A", fontWeight: 500 }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}