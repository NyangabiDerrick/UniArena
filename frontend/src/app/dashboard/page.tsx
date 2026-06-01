"use client"

import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import Link from "next/link"
import { Users, Calendar, Trophy, Newspaper, ArrowUpRight } from "lucide-react"

const stats = [
  { label: "My Clubs", value: "3", sub: "+1 this month", icon: Users, href: "/clubs" },
  { label: "Upcoming Events", value: "5", sub: "Next 30 days", icon: Calendar, href: "/events" },
  { label: "Sports Teams", value: "2", sub: "Active this season", icon: Trophy, href: "/sports" },
  { label: "News Articles", value: "12", sub: "3 new this week", icon: Newspaper, href: "/news" },
]

const quickLinks = [
  { title: "Explore Clubs", desc: "Discover and join clubs that match your interests", href: "/clubs", emoji: "🏛️" },
  { title: "Sports Fixtures", desc: "Check upcoming matches and live results", href: "/sports", emoji: "⚽" },
  { title: "Upcoming Events", desc: "Get tickets to the best university events", href: "/events", emoji: "🎟️" },
  { title: "Latest News", desc: "Stay up to date with campus life", href: "/news", emoji: "📰" },
]

const activity = [
  { text: "Photography Society posted a new article", time: "2h ago" },
  { text: "UniArena FC won 3–1 against City University", time: "Yesterday" },
  { text: "Annual Sports Day tickets now available", time: "2 days ago" },
  { text: "Your Debate Society membership was approved", time: "3 days ago" },
]

export default function DashboardPage() {
  const { data: session } = useSession()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <MainLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto" }} className="fade-up">

        {/* Welcome Hero */}
        <div style={{
          background: "var(--navy)",
          borderRadius: 16,
          padding: "36px 40px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Gold top accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "var(--gold)"
          }} />
          {/* Glow decoration */}
          <div style={{
            position: "absolute", right: -60, top: -60,
            width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.12), transparent 70%)",
            pointerEvents: "none"
          }} />

          <p style={{ fontSize: 11, letterSpacing: "0.12em", color: "var(--gold)", marginBottom: 8 }}>
            {greeting.toUpperCase()}
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 34, fontWeight: 700, color: "white", marginBottom: 6
          }}>
            {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 20 }}>
            Here is what is happening at UniArena today
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{
              fontSize: 11, padding: "4px 12px", borderRadius: 99,
              background: "rgba(201,168,76,0.15)",
              color: "var(--gold)", border: "1px solid rgba(201,168,76,0.25)"
            }}>
              {session?.user?.role}
            </span>
            {session?.user?.faculty && (
              <span style={{
                fontSize: 11, padding: "4px 12px", borderRadius: 99,
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.5)"
              }}>
                {session.user.faculty}
              </span>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16, marginBottom: 24
        }}>
          {stats.map(s => {
            const Icon = s.icon
            return (
              <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "white", borderRadius: 12,
                  padding: "20px 20px 18px",
                  border: "1px solid var(--border)",
                  cursor: "pointer", transition: "box-shadow 0.2s, transform 0.2s"
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = "0 8px 24px rgba(11,29,58,0.10)"
                    el.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = "none"
                    el.style.transform = "translateY(0)"
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "#0B1D3A", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    marginBottom: 14
                  }}>
                    <Icon size={16} color="#C9A84C" />
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 32, fontWeight: 700, color: "var(--navy)", lineHeight: 1
                  }}>{s.value}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", margin: "4px 0 2px" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>

          {/* Quick Links */}
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, color: "var(--navy)", marginBottom: 14
            }}>Explore UniArena</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {quickLinks.map(l => (
                <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "white", borderRadius: 12, padding: "18px 20px",
                    border: "1px solid var(--border)",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    position: "relative", overflow: "hidden"
                  }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.boxShadow = "0 8px 24px rgba(11,29,58,0.10)"
                      el.style.transform = "translateY(-2px)"
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.boxShadow = "none"
                      el.style.transform = "translateY(0)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ fontSize: 24 }}>{l.emoji}</span>
                      <ArrowUpRight size={14} color="var(--text-muted)" />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 4 }}>
                      {l.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {l.desc}
                    </div>
                    {/* Gold bottom accent on hover */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
                      background: "var(--gold)", transform: "scaleX(0)", transition: "transform 0.2s",
                      transformOrigin: "left"
                    }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 18, color: "var(--navy)", marginBottom: 14
            }}>Recent Activity</h2>
            <div style={{
              background: "white", borderRadius: 12,
              border: "1px solid var(--border)", overflow: "hidden"
            }}>
              {activity.map((a, i) => (
                <div key={i} style={{
                  padding: "14px 16px",
                  borderBottom: i < activity.length - 1 ? "1px solid var(--border)" : "none",
                  display: "flex", gap: 10, alignItems: "flex-start"
                }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--gold)", marginTop: 5, flexShrink: 0
                  }} />
                  <div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{a.text}</p>
                    <p style={{ fontSize: 11, color: "#AAAAAA", marginTop: 3 }}>{a.time}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
                <Link href="/notifications" style={{
                  fontSize: 12, fontWeight: 500, color: "var(--navy)", textDecoration: "none"
                }}>
                  View all notifications →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}