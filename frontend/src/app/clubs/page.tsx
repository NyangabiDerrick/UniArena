"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Users } from "lucide-react"
import Link from "next/link"

const categories = ["All","Cultural","Academic","Arts","Religious","Sports","Political","Technology","Social"]

const mockClubs = [
  { id:"1", name:"Photography Society", category:"Arts", description:"A club for photography enthusiasts. We organise photo walks, exhibitions and workshops.", memberCount:124 },
  { id:"2", name:"Chess Club", category:"Academic", description:"Competitive and recreational chess for all skill levels. Weekly tournaments and training sessions.", memberCount:56 },
  { id:"3", name:"African Culture Society", category:"Cultural", description:"Celebrating African heritage through music, dance, food and cultural events.", memberCount:210 },
  { id:"4", name:"Coding Bootcamp", category:"Technology", description:"Weekly coding sessions, hackathons and tech talks for all skill levels.", memberCount:89 },
  { id:"5", name:"Debate Society", category:"Academic", description:"Sharpen your public speaking and critical thinking through competitive debate.", memberCount:67 },
  { id:"6", name:"Drama Club", category:"Arts", description:"Acting, directing and stagecraft. We perform two major productions per year.", memberCount:43 },
  { id:"7", name:"Muslim Students Association", category:"Religious", description:"A community for Muslim students. Weekly prayers, events and support.", memberCount:178 },
  { id:"8", name:"Entrepreneurship Club", category:"Academic", description:"Building the next generation of entrepreneurs through mentorship and pitch competitions.", memberCount:95 },
]

export default function ClubsPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("All")

  const filtered = mockClubs.filter(c => {
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    const mc = selected === "All" || c.category === selected
    return ms && mc
  })

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
            Clubs & Societies
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Discover and join clubs that match your interests</p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search clubs and societies..."
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

        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>
          Showing {filtered.length} club{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map(club => (
            <Link key={club.id} href={`/clubs/${club.id}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white", borderRadius: 14, padding: "22px",
                border: "1px solid #E4E2DC",
                transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer",
                height: "100%", display: "flex", flexDirection: "column"
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
                {/* Logo */}
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: "#EFF6FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700, fontSize: 20, color: "#1D4ED8",
                  marginBottom: 14, flexShrink: 0
                }}>
                  {club.name.charAt(0)}
                </div>

                {/* Info */}
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

                {/* Footer */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingTop: 14, borderTop: "1px solid #F3F4F6"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9CA3AF" }}>
                    <Users size={12} />
                    <span style={{ fontSize: 11 }}>{club.memberCount} members</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#0B1D3A" }}>View club →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 14, color: "#6B6962" }}>No clubs found</p>
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
