"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"

const filters = ["All","Clubs","Sports","Events"]

const mockGalleries = [
  { id:"1", name:"Sports Day 2026", club:"Sports Department", category:"Sports", mediaCount:45, emoji:"🏆", gradient:"linear-gradient(135deg, #F97316, #DC2626)" },
  { id:"2", name:"Photography Exhibition", club:"Photography Society", category:"Clubs", mediaCount:32, emoji:"📸", gradient:"linear-gradient(135deg, #7C3AED, #EC4899)" },
  { id:"3", name:"Football Championship Final", club:"UniArena FC", category:"Sports", mediaCount:78, emoji:"⚽", gradient:"linear-gradient(135deg, #2563EB, #1D4ED8)" },
  { id:"4", name:"African Culture Night", club:"African Culture Society", category:"Events", mediaCount:56, emoji:"🎭", gradient:"linear-gradient(135deg, #D97706, #F59E0B)" },
  { id:"5", name:"Freshers Week 2025", club:"Student Union", category:"Events", mediaCount:120, emoji:"🎉", gradient:"linear-gradient(135deg, #059669, #10B981)" },
  { id:"6", name:"Swimming Regional Meet", club:"UniArena Swim Team", category:"Sports", mediaCount:28, emoji:"🏊", gradient:"linear-gradient(135deg, #0891B2, #2563EB)" },
]

export default function GalleryPage() {
  const [selected, setSelected] = useState("All")
  const filtered = mockGalleries.filter(g => selected === "All" || g.category === selected)

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
            Media Gallery
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Photos and videos from clubs, sports and university events</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setSelected(f)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
              border: "1.5px solid", cursor: "pointer",
              borderColor: selected === f ? "#0B1D3A" : "#E4E2DC",
              background: selected === f ? "#0B1D3A" : "white",
              color: selected === f ? "white" : "#6B6962",
              fontFamily: "'Inter', sans-serif"
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map(gallery => (
            <div key={gallery.id} style={{
              background: "white", borderRadius: 14, overflow: "hidden",
              border: "1px solid #E4E2DC", cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.2s"
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
                height: 160, background: gallery.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 48, position: "relative"
              }}>
                {gallery.emoji}
                <div style={{
                  position: "absolute", bottom: 10, right: 10,
                  background: "rgba(0,0,0,0.4)", color: "white",
                  fontSize: 11, padding: "3px 8px", borderRadius: 99
                }}>
                  📷 {gallery.mediaCount}
                </div>
              </div>
              <div style={{ padding: "16px 18px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A", marginBottom: 4 }}>{gallery.name}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF" }}>
                  <span>{gallery.club}</span>
                  <span>{gallery.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </MainLayout>
  )
}