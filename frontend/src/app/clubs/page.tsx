"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Users } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

const categories = ["All","Cultural","Academic","Arts","Religious","Sports","Political","Technology","Social"]

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("All")

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true)
        const res = await api.getClubs({ search, category: selected })
        setClubs(res.data)
      } catch (err) {
        console.error('Failed to fetch clubs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchClubs()
  }, [search, selected])

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
            Clubs & Societies
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Discover and join clubs that match your interests</p>
        </div>

        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input type="text" placeholder="Search clubs and societies..." value={search}
            onChange={e => setSearch(e.target.value)} style={{
              width: "100%", padding: "11px 14px 11px 40px", fontSize: 13, borderRadius: 10,
              border: "1.5px solid #E4E2DC", background: "white", color: "#1A1916",
              outline: "none", fontFamily: "'Inter', sans-serif"
            }} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelected(cat)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
              border: "1.5px solid", cursor: "pointer",
              borderColor: selected === cat ? "#0B1D3A" : "#E4E2DC",
              background: selected === cat ? "#0B1D3A" : "white",
              color: selected === cat ? "white" : "#6B6962",
              fontFamily: "'Inter', sans-serif"
            }}>{cat}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{
                background: "white", borderRadius: 14, padding: "22px",
                border: "1px solid #E4E2DC", height: 200,
                background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                backgroundSize: "200% 100%"
              }} />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🏛️</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A", marginBottom: 8 }}>
              No clubs yet
            </h3>
            <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 20 }}>
              {search || selected !== "All"
                ? "No clubs match your search. Try different filters."
                : "No clubs have been approved yet. Check back soon."}
            </p>
            {(search || selected !== "All") && (
              <button onClick={() => { setSearch(""); setSelected("All") }} style={{
                padding: "10px 20px", borderRadius: 8, background: "#0B1D3A",
                color: "white", border: "none", cursor: "pointer", fontSize: 13,
                fontFamily: "'Inter', sans-serif"
              }}>Clear filters</button>
            )}
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>
              Showing {clubs.length} club{clubs.length !== 1 ? "s" : ""}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {clubs.map(club => (
                <Link key={club.id} href={`/clubs/${club.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "white", borderRadius: 14, padding: "22px",
                    border: "1px solid #E4E2DC",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    cursor: "pointer", height: "100%", display: "flex", flexDirection: "column"
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
                      width: 48, height: 48, borderRadius: 12, background: "#EFF6FF",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Playfair Display', serif", fontWeight: 700,
                      fontSize: 20, color: "#1D4ED8", marginBottom: 14, flexShrink: 0
                    }}>
                      {club.name.charAt(0)}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A", flex: 1, marginRight: 8 }}>{club.name}</h3>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 99,
                        background: "#F1F5F9", color: "#475569", fontWeight: 500, whiteSpace: "nowrap"
                      }}>{club.category}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#6B6962", lineHeight: 1.6, flex: 1, marginBottom: 16 }}>
                      {club.description}
                    </p>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      paddingTop: 14, borderTop: "1px solid #F3F4F6"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9CA3AF" }}>
                        <Users size={12} />
                        <span style={{ fontSize: 11 }}>{club.memberCount || club._count?.memberships || 0} members</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#0B1D3A" }}>View club →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </div>
    </MainLayout>
  )
}