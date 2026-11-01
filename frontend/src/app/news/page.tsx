"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import type { Article } from "@/lib/types"
import { articleCategory, categoryLabel } from "@/lib/format"

const filters = [
  { label: "All", value: "ALL" },
  { label: "Club", value: "CLUB" },
  { label: "Sports", value: "SPORTS" },
  { label: "University", value: "UNIVERSITY" }
]

const catColors: Record<string, { bg: string; text: string }> = {
  SPORTS: { bg: "#FFF7ED", text: "#C2410C" },
  CLUB: { bg: "#EFF6FF", text: "#1D4ED8" },
  UNIVERSITY: { bg: "#F5F3FF", text: "#6D28D9" }
}

const sourceOf = (a: Article) => {
  if (a.club?.name) return a.club.name
  if (a.team?.name) return a.team.name
  if (a.isUniversityWide) return "University"
  return "UniArena"
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("ALL")

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      api.getArticles({ search })
        .then(res => { if (!cancelled) setArticles(res.data) })
        .catch(err => console.error("Failed to fetch articles:", err))
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [search])

  const filtered = articles.filter(a => selected === "ALL" || articleCategory(a) === selected)
  const pinned = filtered.filter(a => a.isPinned)
  const regular = filtered.filter(a => !a.isPinned)

  const renderCard = (a: Article, highlighted = false) => {
    const key = articleCategory(a)
    const c = catColors[key] || { bg: "#F1F5F9", text: "#475569" }

    return (
      <Link key={a.id} href={`/news/${a.id}`} style={{ textDecoration: "none" }}>
        <div style={{
          background: highlighted ? "#FFFBF0" : "white", borderRadius: 14, padding: "20px 22px",
          border: highlighted ? "1.5px solid #E8D89A" : "1px solid #E4E2DC",
          transition: "box-shadow 0.2s, transform 0.2s"
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 6px 20px rgba(11,29,58,0.08)"; el.style.transform = "translateY(-1px)" }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "translateY(0)" }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: c.bg, color: c.text }}>
              {categoryLabel(key)}
            </span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{sourceOf(a)}</span>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 8 }}>{a.title}</h3>

          <p style={{
            fontSize: 13, color: "#6B6962", lineHeight: 1.5, marginBottom: 12,
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
          } as React.CSSProperties}>
            {a.content?.substring(0, 150)}{(a.content?.length ?? 0) > 150 ? "..." : ""}
          </p>

          <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#9CA3AF" }}>
            <span>{typeof a.author === "object" ? a.author?.name : a.author || "Unknown"}</span>
            <span>{new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
            <span>{Math.max(1, Math.ceil((a.content?.length || 500) / 1000))} min read</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>News & Announcements</h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Stay up to date with everything happening at UniArena</p>
        </div>

        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input type="text" placeholder="Search news and announcements..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "11px 14px 11px 40px", fontSize: 13, borderRadius: 10, border: "1.5px solid #E4E2DC", background: "white", color: "#1A1916", outline: "none", fontFamily: "'Inter', sans-serif" }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {filters.map(f => (
            <button key={f.value} onClick={() => setSelected(f.value)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, border: "1.5px solid", cursor: "pointer",
              borderColor: selected === f.value ? "#0B1D3A" : "#E4E2DC",
              background: selected === f.value ? "#0B1D3A" : "white",
              color: selected === f.value ? "white" : "#6B6962",
              fontFamily: "'Inter', sans-serif"
            }}>{f.label}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading articles...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📰</p>
            <p style={{ fontSize: 14, color: "#6B6962" }}>No articles found</p>
          </div>
        ) : (
          <>
            {pinned.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#C9A84C", letterSpacing: "0.1em", marginBottom: 12 }}>📌 PINNED</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pinned.map(a => renderCard(a, true))}
                </div>
              </div>
            )}
            {regular.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {regular.map(a => renderCard(a, false))}
              </div>
            )}
          </>
        )}

      </div>
    </MainLayout>
  )
}