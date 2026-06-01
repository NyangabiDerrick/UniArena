"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Users } from "lucide-react"
import Link from "next/link"

const sports = ["All","Football","Basketball","Swimming","Athletics","Rugby","Tennis","Cricket","Volleyball"]

const mockTeams = [
  { id:"1", name:"UniArena FC", sport:"Football", description:"The university's flagship football team competing in the national university league.", memberCount:25, wins:8, losses:2, draws:1 },
  { id:"2", name:"UniArena Ballers", sport:"Basketball", description:"Our basketball team competing in the regional university basketball championship.", memberCount:15, wins:6, losses:4, draws:0 },
  { id:"3", name:"UniArena Swim Team", sport:"Swimming", description:"Competitive swimming across all strokes and distances at national level.", memberCount:20, wins:10, losses:1, draws:0 },
  { id:"4", name:"UniArena Athletics", sport:"Athletics", description:"Track and field athletes representing the university at regional competitions.", memberCount:30, wins:5, losses:3, draws:2 },
  { id:"5", name:"UniArena Rugby", sport:"Rugby", description:"Fifteen-a-side rugby competing in the university rugby union league.", memberCount:28, wins:4, losses:5, draws:1 },
  { id:"6", name:"UniArena Tennis", sport:"Tennis", description:"Singles and doubles tennis players competing at university level.", memberCount:12, wins:7, losses:2, draws:0 },
]

const sportEmoji: Record<string,string> = { Football:"⚽", Basketball:"🏀", Swimming:"🏊", Athletics:"🏃", Rugby:"🏉", Tennis:"🎾", Cricket:"🏏", Volleyball:"🏐" }

export default function SportsPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("All")

  const filtered = mockTeams.filter(t => {
    const ms = t.name.toLowerCase().includes(search.toLowerCase()) || t.sport.toLowerCase().includes(search.toLowerCase())
    const mc = selected === "All" || t.sport === selected
    return ms && mc
  })

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
            Sports Teams
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>
            Follow your university sports teams and stay up to date with fixtures and results
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search sports teams..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "11px 14px 11px 40px",
              fontSize: 13, borderRadius: 10,
              border: "1.5px solid #E4E2DC",
              background: "white", color: "#1A1916",
              outline: "none", fontFamily: "'Inter', sans-serif"
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {sports.map(s => (
            <button key={s} onClick={() => setSelected(s)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
              border: "1.5px solid", cursor: "pointer",
              borderColor: selected === s ? "#0B1D3A" : "#E4E2DC",
              background: selected === s ? "#0B1D3A" : "white",
              color: selected === s ? "white" : "#6B6962",
              fontFamily: "'Inter', sans-serif"
            }}>{s}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map(team => (
            <Link key={team.id} href={`/sports/${team.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white", borderRadius: 14, padding: "22px",
                border: "1px solid #E4E2DC",
                transition: "box-shadow 0.2s, transform 0.2s",
                cursor: "pointer"
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
                {/* Sport icon */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "#FFF7ED",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 14
                }}>
                  {sportEmoji[team.sport] || "🏆"}
                </div>

                {/* Info */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{team.name}</h3>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 99,
                    background: "#FFF7ED", color: "#C2410C", fontWeight: 500
                  }}>{team.sport}</span>
                </div>

                <p style={{ fontSize: 12, color: "#6B6962", lineHeight: 1.5, marginBottom: 16 }}>
                  {team.description}
                </p>

                {/* Record */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  paddingTop: 14, borderTop: "1px solid #F3F4F6"
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#16A34A" }}>W {team.wins}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#DC2626" }}>L {team.losses}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>D {team.draws}</span>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "#9CA3AF" }}>
                    <Users size={12} />
                    <span style={{ fontSize: 11 }}>{team.memberCount}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 14, color: "#6B6962" }}>No teams found</p>
            <button onClick={() => { setSearch(""); setSelected("All") }} style={{
              marginTop: 12, fontSize: 13, color: "#0B1D3A",
              background: "none", border: "none", cursor: "pointer", textDecoration: "underline"
            }}>Clear filters</button>
          </div>
        )}

      </div>
    </MainLayout>
  )
}