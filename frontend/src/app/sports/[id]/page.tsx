"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft, Calendar, MapPin, Users, Trophy } from "lucide-react"
import { api } from "@/lib/api"

const tabs = ["Fixtures", "Results", "Squad", "Training"]

const sportEmoji: Record<string, string> = {
  Football: "⚽", Basketball: "🏀", Swimming: "🏊", Athletics: "🏃",
  Rugby: "🏉", Tennis: "🎾", Cricket: "🏏", Volleyball: "🏐"
}

const card = {
  background: "white", borderRadius: 16, padding: "28px 32px", border: "1px solid #E4E2DC"
} as const

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

export default function SportTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("Fixtures")

  useEffect(() => {
    api.getTeam(id)
      .then(res => setTeam(res.data))
      .catch(err => console.error("Failed to load team:", err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#9CA3AF" }}>Loading team...</p>
      </MainLayout>
    )
  }

  if (!team) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 12 }}>Team not found</p>
          <Link href="/sports" style={{ fontSize: 13, color: "#0B1D3A", textDecoration: "underline" }}>Back to Sports</Link>
        </div>
      </MainLayout>
    )
  }

  const fixtures: any[] = team.fixtures || []
  const upcoming = fixtures.filter(f => f.status === "UPCOMING" || f.status === "LIVE")
  const completed = fixtures
    .filter(f => f.status === "COMPLETED")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
  const squad: any[] = team.squadMembers || []

  const outcome = (f: any) => {
    const scored = f.isHome ? f.homeScore : f.awayScore
    const conceded = f.isHome ? f.awayScore : f.homeScore
    if (scored > conceded) return { label: "W", bg: "#F0FDF4", color: "#15803D" }
    if (scored < conceded) return { label: "L", bg: "#FEF2F2", color: "#DC2626" }
    return { label: "D", bg: "#F3F4F6", color: "#6B7280" }
  }

  const record = completed.reduce(
    (acc, f) => {
      const o = outcome(f).label
      if (o === "W") acc.wins++
      else if (o === "L") acc.losses++
      else acc.draws++
      return acc
    },
    { wins: 0, losses: 0, draws: 0 }
  )

  const homeBadge = (isHome: boolean) => (
    <span style={{
      fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500,
      background: isHome ? "#F0FDF4" : "#FFF7ED", color: isHome ? "#15803D" : "#C2410C"
    }}>{isHome ? "Home" : "Away"}</span>
  )

  const empty = (icon: React.ReactNode, text: string) => (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14, color: "#6B6962" }}>{text}</p>
    </div>
  )

  return (
    <MainLayout>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        <Link href="/sports" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#6B6962", textDecoration: "none", marginBottom: 20
        }}>
          <ArrowLeft size={15} /> Back to Sports
        </Link>

        {/* Banner */}
        <div style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", borderRadius: "16px 16px 0 0", height: 170 }} />

        {/* Team header */}
        <div style={{
          background: "white", border: "1px solid #E4E2DC", borderTop: "none",
          borderRadius: "0 0 16px 16px", padding: "0 32px 32px", marginBottom: 28
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 18, background: "#FFF7ED",
              border: "4px solid white", marginTop: -40, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38,
              boxShadow: "0 4px 12px rgba(11,29,58,0.12)"
            }}>{sportEmoji[team.sport] || "🏆"}</div>
            <div style={{ paddingBottom: 4 }}>
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700,
                color: "#0B1D3A", marginBottom: 8
              }}>{team.name}</h1>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, fontSize: 13, color: "#9CA3AF" }}>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#FFF7ED", color: "#C2410C", fontWeight: 500 }}>
                  {team.sport}
                </span>
                {team.season && <span>Season {team.season}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Users size={13} /> {team._count?.squadMembers ?? squad.length} players
                </span>
              </div>
            </div>
          </div>

          {team.description && (
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginTop: 24 }}>{team.description}</p>
          )}

          {/* Record */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
            marginTop: 28, paddingTop: 24, borderTop: "1px solid #F3F4F6"
          }}>
            {[
              { label: "Wins", value: record.wins, color: "#15803D" },
              { label: "Losses", value: record.losses, color: "#DC2626" },
              { label: "Draws", value: record.draws, color: "#6B7280" }
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#F3F4F6", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 24 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "#0B1D3A" : "#6B6962",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              fontFamily: "'Inter', sans-serif"
            }}>{tab}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={card}>

          {activeTab === "Fixtures" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 20 }}>Upcoming Fixtures</h2>
              {upcoming.length === 0
                ? empty(<Calendar size={32} color="#E4E2DC" style={{ margin: "0 auto" }} />, "No upcoming fixtures scheduled")
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {upcoming.map(f => (
                      <div key={f.id} style={{
                        display: "flex", alignItems: "center", gap: 18,
                        padding: "18px 22px", borderRadius: 12, border: "1px solid #E4E2DC"
                      }}>
                        <div style={{
                          width: 46, height: 46, borderRadius: 11, background: "#EFF6FF", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}><Calendar size={20} color="#1D4ED8" /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A" }}>
                              {f.isHome ? "vs" : "@"} {f.opposition}
                            </p>
                            {homeBadge(f.isHome)}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, fontSize: 12, color: "#9CA3AF" }}>
                            <span>{fmtDate(f.scheduledAt)} · {fmtTime(f.scheduledAt)}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} /> {f.venue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {activeTab === "Results" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 20 }}>Recent Results</h2>
              {completed.length === 0
                ? empty(<Trophy size={32} color="#E4E2DC" style={{ margin: "0 auto" }} />, "No results yet")
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {completed.map(f => {
                      const o = outcome(f)
                      const left = f.isHome ? team.name : f.opposition
                      const right = f.isHome ? f.opposition : team.name
                      return (
                        <div key={f.id} style={{
                          display: "flex", alignItems: "center", gap: 18,
                          padding: "18px 22px", borderRadius: 12, border: "1px solid #E4E2DC"
                        }}>
                          <span style={{
                            width: 36, height: 36, borderRadius: 9, flexShrink: 0, fontSize: 13, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: o.bg, color: o.color
                          }}>{o.label}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 4 }}>
                              {left} {f.homeScore} – {f.awayScore} {right}
                            </p>
                            <p style={{ fontSize: 12, color: "#9CA3AF" }}>{fmtDate(f.scheduledAt)} · {f.venue}</p>
                          </div>
                          {homeBadge(f.isHome)}
                        </div>
                      )
                    })}
                  </div>
                )}
            </div>
          )}

          {activeTab === "Squad" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 20 }}>Squad</h2>
              {squad.length === 0
                ? empty(<Users size={32} color="#E4E2DC" style={{ margin: "0 auto" }} />, "No players added to the squad yet")
                : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {squad.map(p => (
                      <div key={p.id} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 18px", borderRadius: 12, border: "1px solid #E4E2DC"
                      }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 10, background: "#FFF7ED", color: "#C2410C", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15
                        }}>{p.user?.name?.charAt(0)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "#0B1D3A" }}>{p.user?.name}</p>
                          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{p.position || "Player"}</p>
                        </div>
                        <span style={{
                          fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500,
                          background: p.isAvailable ? "#F0FDF4" : "#FEF2F2",
                          color: p.isAvailable ? "#15803D" : "#DC2626"
                        }}>{p.isAvailable ? "Available" : "Unavailable"}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {activeTab === "Training" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 20 }}>Training Schedule</h2>
              {empty(
                <Calendar size={32} color="#E4E2DC" style={{ margin: "0 auto" }} />,
                "Training times haven't been published yet. The team leader will be able to add them soon."
              )}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  )
}