"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { useEffect } from "react"

const filters = ["All","Clubs","Sports","University"]

const mockArticles = [
  { id:"1", title:"UniArena FC wins the National University Football Championship", excerpt:"After a thrilling final against City University, our football team clinched the national title with a 3-1 victory.", author:"Sports Reporter", club:"UniArena FC", category:"Sports", date:"May 28, 2026", isPinned:true, readTime:"3 min" },
  { id:"2", title:"Photography Society wins Best University Club award", excerpt:"The Photography Society has been named the Best University Club at the National Student Union Awards for the second year running.", author:"Jane Leader", club:"Photography Society", category:"Clubs", date:"May 25, 2026", isPinned:true, readTime:"2 min" },
  { id:"3", title:"University announces new student activity centre opening in September", excerpt:"The long-awaited student activity centre will open its doors in September 2026 featuring new sports facilities.", author:"University Communications", club:"University", category:"University", date:"May 22, 2026", isPinned:false, readTime:"4 min" },
  { id:"4", title:"Debate Society prepares for national championship", excerpt:"After winning the regional qualifiers, the Debate Society is now preparing for the national championship next month.", author:"Debate Society", club:"Debate Society", category:"Clubs", date:"May 20, 2026", isPinned:false, readTime:"2 min" },
  { id:"5", title:"Swimming team breaks three university records at regional meet", excerpt:"The UniArena Swim Team had an outstanding performance at the regional meet, breaking three long-standing records.", author:"Sports Reporter", club:"UniArena Swim Team", category:"Sports", date:"May 18, 2026", isPinned:false, readTime:"3 min" },
  { id:"6", title:"African Culture Night ticket sales open — limited spots available", excerpt:"Tickets for the highly anticipated African Culture Night are now on sale. With only 300 spots available, book early.", author:"African Culture Society", club:"African Culture Society", category:"Clubs", date:"May 15, 2026", isPinned:false, readTime:"1 min" },
]

const catColors: Record<string, { bg: string; text: string }> = {
  Sports: { bg: "#FFF7ED", text: "#C2410C" },
  Clubs: { bg: "#EFF6FF", text: "#1D4ED8" },
  University: { bg: "#F5F3FF", text: "#6D28D9" },
}

export default function NewsPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("All")

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        const res = await api.getArticles({ search })
        setArticles(res.data)
      } catch (err) {
        console.error('Failed to fetch articles:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [search])

  const filtered = articles.filter(a =>
    selected === "All" || a.category === selected
  )
  const pinned = filtered.filter(a => a.isPinned)
  const regular = filtered.filter(a => !a.isPinned)

  const pinned = filtered.filter(a => a.isPinned)
  const regular = filtered.filter(a => !a.isPinned)

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
            News & Announcements
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Stay up to date with everything happening at UniArena</p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input type="text" placeholder="Search news and announcements..." value={search} onChange={e => setSearch(e.target.value)} style={{
            width: "100%", padding: "11px 14px 11px 40px", fontSize: 13, borderRadius: 10,
            border: "1.5px solid #E4E2DC", background: "white", color: "#1A1916",
            outline: "none", fontFamily: "'Inter', sans-serif"
          }} />
        </div>

        {/* Filters */}
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

        {/* Pinned */}
        {pinned.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 12 }}>📌 PINNED</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pinned.map(a => {
                const c = catColors[a.category] || { bg: "#F1F5F9", text: "#475569" }
                return (
                  <Link key={a.id} href={`/news/${a.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "#FFFBF0", borderRadius: 14, padding: "20px 22px",
                      border: "1.5px solid #E8D89A",
                      transition: "box-shadow 0.2s"
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(11,29,58,0.08)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
                    >
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: c.bg, color: c.text }}>{a.category}</span>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{a.club}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 8 }}>{a.title}</h3>
                      <p style={{ fontSize: 13, color: "#6B6962", lineHeight: 1.5, marginBottom: 12 }}>{a.excerpt}</p>
                      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#9CA3AF" }}>
                        <span>{a.author}</span><span>{a.date}</span><span>{a.readTime} read</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Regular */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {regular.map(a => {
            const c = catColors[a.category] || { bg: "#F1F5F9", text: "#475569" }
            return (
              <Link key={a.id} href={`/news/${a.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "white", borderRadius: 14, padding: "20px 22px",
                  border: "1px solid #E4E2DC",
                  transition: "box-shadow 0.2s, transform 0.2s"
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = "0 6px 20px rgba(11,29,58,0.08)"
                    el.style.transform = "translateY(-1px)"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = "none"
                    el.style.transform = "translateY(0)"
                  }}
                >
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: c.bg, color: c.text }}>{a.category}</span>
                    <span style={{ fontSize: 11, color: "#9CA3AF" }}>{a.club}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 8 }}>{a.title}</h3>
                  <p style={{ fontSize: 13, color: "#6B6962", lineHeight: 1.5, marginBottom: 12 }}>{a.excerpt}</p>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#9CA3AF" }}>
                    <span>{a.author}</span><span>{a.date}</span><span>{a.readTime} read</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </MainLayout>
  )
}