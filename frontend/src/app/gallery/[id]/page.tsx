"use client"

import { useState, use } from "react"
import Link from "next/link"
import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react"
import { galleries } from "@/lib/galleryData"

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const album = galleries.find(g => g.id === id)
  const [viewing, setViewing] = useState<number | null>(null)

  if (!album) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Album not found</p>
          <Link href="/gallery" style={{ fontSize: 13, color: "#0B1D3A", textDecoration: "underline" }}>Back to Gallery</Link>
        </div>
      </MainLayout>
    )
  }

  const count = Math.min(album.mediaCount, 24)
  const tiles = Array.from({ length: count }, (_, i) => i)
  const shade = (i: number) => `hsl(${(i * 37) % 360}, 45%, ${62 + (i % 3) * 6}%)`

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Link href="/gallery" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B6962", textDecoration: "none", marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to Gallery
        </Link>

        <div style={{ background: album.gradient, borderRadius: 16, padding: "36px 32px", marginBottom: 28, color: "white" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{album.emoji}</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{album.name}</h1>
          <p style={{ fontSize: 13, opacity: 0.9 }}>{album.club} · {album.date} · {album.mediaCount} items</p>
        </div>

        <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
          Placeholder tiles shown. Real photos will appear here once uploads are enabled.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {tiles.map(i => (
            <button key={i} onClick={() => setViewing(i)} style={{
              aspectRatio: "1 / 1", borderRadius: 12, border: "none", cursor: "pointer",
              background: shade(i), fontSize: 24
            }}>{album.emoji}</button>
          ))}
        </div>
      </div>

      {viewing !== null && (
        <div onClick={() => setViewing(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <button onClick={() => setViewing(null)} style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "white", cursor: "pointer" }}>
            <X size={28} />
          </button>
          <button onClick={e => { e.stopPropagation(); setViewing((viewing - 1 + count) % count) }} style={{ position: "absolute", left: 24, background: "none", border: "none", color: "white", cursor: "pointer" }}>
            <ChevronLeft size={36} />
          </button>
          <div onClick={e => e.stopPropagation()} style={{
            width: "min(560px, 80vw)", aspectRatio: "4 / 3", borderRadius: 16,
            background: shade(viewing), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72
          }}>{album.emoji}</div>
          <button onClick={e => { e.stopPropagation(); setViewing((viewing + 1) % count) }} style={{ position: "absolute", right: 24, background: "none", border: "none", color: "white", cursor: "pointer" }}>
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </MainLayout>
  )
}