"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Users } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { imageSrc } from "@/lib/groupImagesApi"
import type { Team } from "@/lib/types"
import { useMyGroups } from "@/lib/myGroups"

type TeamCard = Team & { logoUrl?: string | null }

const sports = ["All", "Football", "Basketball", "Swimming", "Athletics", "Rugby", "Tennis", "Cricket", "Volleyball"]

const sportEmoji: Record<string, string> = { Football: "⚽", Basketball: "🏀", Swimming: "🏊", Athletics: "🏃", Rugby: "🏉", Tennis: "🎾", Cricket: "🏏", Volleyball: "🏐" }

export default function SportsPage() {
  const groups = useMyGroups()
  const [teams, setTeams] = useState<TeamCard[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("All")
  const [mineOnly, setMineOnly] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      api.getTeams({ sport: selected, search })
        .then(res => { if (!cancelled) setTeams(res.data as TeamCard[]) })
        .catch(err => console.error("Failed to fetch teams:", err))
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [search, selected])

  const shown = teams.filter(t => !mineOnly || groups.teamIds.has(t.id))

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
            Sports Teams
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>
            Follow your university sports teams and stay up to date with fixtures and results
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
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
          <label style={{
            display: "flex", alignItems: "center", gap: 8, padding: "0 16px", background: mineOnly ? "#0B1D3A" : "white",
            border: "1.5px solid #E4E2DC", borderRadius: 10, fontSize: 13, cursor: "pointer",
            color: mineOnly ? "white" : "#6B6962", whiteSpace: "nowrap"
          }}>
            <input type="checkbox" checked={mineOnly} onChange={e => setMineOnly(e.target.checked)} />
            My teams only
          </label>
        </div>

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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {shown.map(team => {
            const logo = imageSrc(team.logoUrl)
            const mine = groups.teamIds.has(team.id)
            return (
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
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, overflow: "hidden",
                    background: "#FFF7ED",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, marginBottom: 14
                  }}>
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={`${team.name} logo`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (sportEmoji[team.sport] || "🏆")}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{team.name}</h3>
                    <div style={{ display: "flex", gap: 4 }}>
                      {mine && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#FFFBEB", color: "#92400E", fontWeight: 500 }}>Your team</span>}
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 99,
                        background: "#FFF7ED", color: "#C2410C", fontWeight: 500
                      }}>{team.sport}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: "#6B6962", lineHeight: 1.5, marginBottom: 16 }}>
                    {team.description}
                  </p>

                  <div style={{
                    display: "flex", alignItems: "center", gap: 16,
                    paddingTop: 14, borderTop: "1px solid #F3F4F6"
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#16A34A" }}>W {team.wins ?? 0}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#DC2626" }}>L {team.losses ?? 0}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6B7280" }}>D {team.draws ?? 0}</span>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "#9CA3AF" }}>
                      <Users size={12} />
                      <span style={{ fontSize: 11 }}>{team.memberCount ?? team._count?.squadMembers ?? 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {shown.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 14, color: "#6B6962" }}>
              {mineOnly ? "You aren't in a sports team yet." : "No teams found"}
            </p>
            <button onClick={() => { setSearch(""); setSelected("All"); setMineOnly(false) }} style={{
              marginTop: 12, fontSize: 13, color: "#0B1D3A",
              background: "none", border: "none", cursor: "pointer", textDecoration: "underline"
            }}>Clear filters</button>
          </div>
        )}

      </div>
    </MainLayout>
  )
}