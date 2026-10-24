"use client"

import { useState } from "react"
import Link from "next/link"
import MainLayout from "@/components/layout/MainLayout"
import { galleries } from "@/lib/galleryData"

const filters = ["All", "Clubs", "Sports", "Events"]

export default function GalleryPage() {
  const [selected, setSelected] = useState("All")
  const filtered = galleries.filter(g => selected === "All" || g.category === selected)

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>Media Gallery</h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Photos and videos from clubs, sports and university events</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setSelected(f)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, border: "1.5px solid", cursor: "pointer",
              borderColor: selected === f ? "#0B1D3A" : "#E4E2DC",
              background: selected === f ? "#0B1D3A" : "white",
              color: selected === f ? "white" : "#6B6962", fontFamily: "'Inter', sans-serif"
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {filtered.map(g => (
            <Link key={g.id} href={`/gallery/${g.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #E4E2DC", cursor: "pointer", transition: "box-shadow 0.2s, transform 0.2s" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 8px 24px rgba(11,29,58,0.10)"; el.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "translateY(0)" }}
              >
                <div style={{ height: 160, background: g.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, position: "relative" }}>
                  {g.emoji}
                  <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.4)", color: "white", fontSize: 11, padding: "3px 8px", borderRadius: 99 }}>
                    📷 {g.mediaCount}
                  </div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A", marginBottom: 4 }}>{g.name}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF" }}>
                    <span>{g.club}</span><span>{g.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}