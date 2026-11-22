"use client"

import { Suspense, useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Users, ArrowLeft, Building2, Landmark } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { imageSrc } from "@/lib/groupImagesApi"
import type { Club } from "@/lib/types"
import { useMyGroups, useMineFromUrl } from "@/lib/myGroups"


type View = "home" | "CLUB" | "SOCIETY" | "MINE"

function ClubsContent() {
  const groups = useMyGroups()
  const mineFromUrl = useMineFromUrl()
  const mineOnly = mineFromUrl
  const [result, setResult] = useState<{ key: string; clubs: Club[]; failed?: boolean }>({ key: "", clubs: [] })
  const [search, setSearch] = useState("")
  const [view, setView] = useState<View>(mineOnly ? "MINE" : "home")
  const type = view === "CLUB" || view === "SOCIETY" ? view : ""

  const key = JSON.stringify([search, type])
  const clubs = result.clubs.filter(c => !mineOnly || groups.clubIds.has(c.id))
  const loading = result.key !== key

  useEffect(() => {
    const params: { search?: string; type?: string } = {}
    if (search) params.search = search
    if (type) params.type = type

    api.getClubs(params)
      .then(res => setResult({ key, clubs: res.data }))
      .catch(err => {
        console.error("Failed to fetch clubs:", err)
        setResult({ key, clubs: [], failed: true })
      })
  }, [search, type, key])

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
            Clubs & Societies
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Discover and join the groups that match your interests</p>
        </div>

        {view === "home" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
            {([
              { v: "CLUB" as View, title: "Clubs", text: "Browse every club", Icon: Building2, n: result.clubs.filter(c => c.type === "CLUB").length },
              { v: "SOCIETY" as View, title: "Societies", text: "See all the university societies", Icon: Landmark, n: result.clubs.filter(c => c.type === "SOCIETY").length }
            ]).map(({ v, title, text, Icon, n }) => (
              <button key={v} onClick={() => { setView(v); setSearch("") }}
                style={{ textAlign: "left", background: "white", border: "1px solid #E4E2DC", borderRadius: 14, padding: 28, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                <Icon size={28} color="#1D4ED8" style={{ marginBottom: 14 }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0B1D3A", marginBottom: 6 }}>{title}</h2>
                <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 14 }}>{text}</p>
                <span style={{ fontSize: 12, fontWeight: 500, color: "#0B1D3A" }}>{loading ? "" : result.failed ? "Couldn't load" : n === 0 ? "None yet" : `${n} ${n === 1 ? "group" : "groups"} · View →`}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {view !== "MINE" && (
              <button onClick={() => setView("home")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#0B1D3A", marginBottom: 16, padding: 0 }}>
                <ArrowLeft size={14} /> Clubs & Societies
              </button>
            )}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
              <input type="text" placeholder={view === "SOCIETY" ? "Search societies..." : view === "CLUB" ? "Search clubs..." : "Search your groups..."} value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "11px 14px 11px 40px", fontSize: 13, borderRadius: 10, border: "1.5px solid #E4E2DC", background: "white", color: "#1A1916", outline: "none", fontFamily: "'Inter', sans-serif" }} />
            </div>
          </>
        )}

        {view === "home" ? null : loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : clubs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🏛️</p>
            <p style={{ fontSize: 14, color: "#6B6962" }}>{mineOnly ? "You haven't joined a club or society that matches yet." : "Nothing matches your search yet."}</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>Showing {clubs.length}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {clubs.map(club => {
                const logo = imageSrc(club.logoUrl)
                return (
                  <Link key={club.id} href={`/clubs/${club.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "white", borderRadius: 14, padding: 22, border: "1px solid #E4E2DC", height: "100%", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s, transform 0.2s" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 8px 24px rgba(11,29,58,0.10)"; el.style.transform = "translateY(-2px)" }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "translateY(0)" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#1D4ED8", marginBottom: 14 }}>
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} alt={`${club.name} logo`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : club.name.charAt(0)}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A", flex: 1 }}>{club.name}</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                          {groups.clubIds.has(club.id) && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#FFFBEB", color: "#92400E", fontWeight: 500 }}>Yours</span>}
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: club.type === "SOCIETY" ? "#F5F3FF" : "#EFF6FF", color: club.type === "SOCIETY" ? "#6D28D9" : "#1D4ED8", fontWeight: 500 }}>
                            {club.type === "SOCIETY" ? "Society" : "Club"}
                          </span>
                          {club.category && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#F1F5F9", color: "#475569", fontWeight: 500 }}>{club.category}</span>}
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: "#6B6962", lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{club.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid #F3F4F6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9CA3AF" }}>
                          <Users size={12} />
                          <span style={{ fontSize: 11 }}>{club._count?.memberships ?? 0} members</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#0B1D3A" }}>View →</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default function ClubsPage() {
  return (
    <Suspense>
      <ClubsContent />
    </Suspense>
  )
}
