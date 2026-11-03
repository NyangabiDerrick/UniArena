"use client"

import { useState, useEffect, use } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import * as T from "@/lib/sportsToolsApi"

const card: React.CSSProperties = { background: "white", borderRadius: 16, border: "1px solid #E4E2DC", padding: 24 }
const h2: React.CSSProperties = { fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 14 }
const when = (d: string) => new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [team, setTeam] = useState<T.TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    T.getPublicTeam(id)
      .then(t => { if (!cancelled) setTeam(t) })
      .catch(() => { if (!cancelled) setTeam(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  if (loading) return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p></MainLayout>
  if (!team) return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Team not found</p></MainLayout>

  const upcoming = team.fixtures.filter(f => f.status !== "COMPLETED")
  const results = team.fixtures.filter(f => f.status === "COMPLETED").reverse()
  let w = 0, l = 0, d = 0
  for (const f of results) {
    const { ours, theirs } = T.scoresOf(f)
    if ((ours ?? 0) > (theirs ?? 0)) w++
    else if ((ours ?? 0) < (theirs ?? 0)) l++
    else d++
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 940, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ ...card, background: "#0B1D3A", border: "none", color: "white" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.12em", color: "#C9A84C", marginBottom: 8 }}>{team.sport.toUpperCase()}{team.season ? ` · ${team.season}` : ""}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, marginBottom: 10 }}>{team.name}</h1>
          {team.description && <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 16 }}>{team.description}</p>}
          <div style={{ display: "flex", gap: 28, fontSize: 13 }}>
            <span><strong style={{ fontSize: 20 }}>{w}</strong> won</span>
            <span><strong style={{ fontSize: 20 }}>{d}</strong> drawn</span>
            <span><strong style={{ fontSize: 20 }}>{l}</strong> lost</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Users size={14} /><strong style={{ fontSize: 20 }}>{team.squadMembers.length}</strong> players</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={card}>
            <h2 style={h2}>Upcoming fixtures</h2>
            {upcoming.length === 0 ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>No fixtures scheduled.</p> : upcoming.map(f => (
              <div key={f.id} style={{ padding: "10px 0", borderTop: "1px solid #F3F4F6" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>vs {f.opposition}</p>
                <p style={{ fontSize: 12, color: "#9CA3AF", display: "flex", gap: 12, marginTop: 3 }}>
                  <span style={{ display: "flex", gap: 4, alignItems: "center" }}><Calendar size={12} />{when(f.scheduledAt)}</span>
                  <span style={{ display: "flex", gap: 4, alignItems: "center" }}><MapPin size={12} />{f.venue}</span>
                </p>
              </div>
            ))}
          </div>

          <div style={card}>
            <h2 style={h2}>Results</h2>
            {results.length === 0 ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>No results yet.</p> : results.map(f => {
              const { ours, theirs } = T.scoresOf(f)
              return (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #F3F4F6", fontSize: 14 }}>
                  <span style={{ color: "#0B1D3A" }}>vs {f.opposition}</span>
                  <strong style={{ color: "#0B1D3A" }}>{ours} - {theirs}</strong>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={card}>
            <h2 style={h2}>Squad</h2>
            {team.squadMembers.length === 0 ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>The squad has not been announced.</p> : team.squadMembers.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #F3F4F6", fontSize: 14 }}>
                <span style={{ color: "#0B1D3A" }}>{m.jerseyNumber !== null ? `#${m.jerseyNumber} ` : ""}{m.user.name}</span>
                <span style={{ color: "#9CA3AF", fontSize: 12 }}>{m.isInjured ? "Injured" : m.position ?? ""}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <h2 style={h2}>Training</h2>
            {team.trainingSessions.length === 0 ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>No training times published.</p> : team.trainingSessions.map(s => (
              <div key={s.id} style={{ padding: "8px 0", borderTop: "1px solid #F3F4F6", fontSize: 14, color: "#0B1D3A" }}>
                <strong>{T.DAYS[s.dayOfWeek]}</strong>
                <span style={{ color: "#6B6962", display: "flex", gap: 12, fontSize: 12, marginTop: 3 }}>
                  <span style={{ display: "flex", gap: 4, alignItems: "center" }}><Clock size={12} />{s.startTime} - {s.endTime}</span>
                  <span style={{ display: "flex", gap: 4, alignItems: "center" }}><MapPin size={12} />{s.venue}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}