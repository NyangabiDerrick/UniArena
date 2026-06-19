"use client"

import { useState, useEffect, use } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"


export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getArticle(id)
      .then(res => setArticle(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const getCategory = (a: any) => {
    if (a?.team) return "Sports"
    if (a?.club) return "Clubs"
    if (a?.isUniversityWide) return "University"
    return "General"
  }

  const getSource = (a: any) => {
    if (a?.club?.name) return a.club.name
    if (a?.team?.name) return a.team.name
    return "UniArena"
  }

  const catColors: Record<string, { bg: string; text: string }> = {
    Sports: { bg: "#FFF7ED", text: "#C2410C" },
    Clubs: { bg: "#EFF6FF", text: "#1D4ED8" },
    University: { bg: "#F5F3FF", text: "#6D28D9" },
    General: { bg: "#F1F5F9", text: "#475569" },
  }

  const catEmojis: Record<string, string> = {
    Sports: "⚽",
    Clubs: "🏛️",
    University: "🎓",
    General: "📰",
  }

  if (loading) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 14, color: "#9CA3AF" }}>Loading article...</p>
        </div>
      </MainLayout>
    )
  }

  if (!article) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📰</p>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Article not found</p>
          <Link href="/news" style={{
            display: "inline-block", marginTop: 16, fontSize: 13,
            color: "#0B1D3A", textDecoration: "underline"
          }}>Back to News</Link>
        </div>
      </MainLayout>
    )
  }

  const category = getCategory(article)
  const source = getSource(article)
  const c = catColors[category]
  const emoji = catEmojis[category]
  const readTime = Math.ceil((article.content?.length || 500) / 1000)

  return (
    <MainLayout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Back */}
        <Link href="/news" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#6B6962", textDecoration: "none", marginBottom: 20
        }}>
          <ArrowLeft size={15} /> Back to News
        </Link>

        <div style={{
          background: "white", borderRadius: 20,
          border: "1px solid #E4E2DC",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(11,29,58,0.06)"
        }}>

          {/* Banner */}
          <div style={{
            background: category === "Sports"
              ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
              : category === "Clubs"
              ? "linear-gradient(135deg, #7C3AED, #6D28D9)"
              : "linear-gradient(135deg, #0B1D3A, #152848)",
            height: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 72
          }}>
            {emoji}
          </div>

          {/* Content */}
          <div style={{ padding: "36px 40px" }}>

            {/* Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{
                fontSize: 11, padding: "4px 12px", borderRadius: 99,
                fontWeight: 500, background: c.bg, color: c.text
              }}>{category}</span>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>{source}</span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28, fontWeight: 700, color: "#0B1D3A",
              lineHeight: 1.3, marginBottom: 20
            }}>
              {article.title}
            </h1>

            {/* Meta */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 20,
              paddingBottom: 24, marginBottom: 32,
              borderBottom: "1px solid #E4E2DC",
              fontSize: 13, color: "#9CA3AF"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <User size={14} />
                {article.author?.name || "UniArena"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Calendar size={14} />
                {new Date(article.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={14} />
                {readTime} min read
              </div>
            </div>

            {/* Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {(article.content || "").split("\n\n").map((para: string, i: number) =>
                para.trim() ? (
                  <p key={i} style={{
                    fontSize: 15, color: "#374151",
                    lineHeight: 1.8, margin: 0
                  }}>
                    {para.trim()}
                  </p>
                ) : null
              )}
            </div>

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8,
                marginTop: 36, paddingTop: 24, borderTop: "1px solid #E4E2DC"
              }}>
                {article.tags.map((tag: string) => (
                  <span key={tag} style={{
                    fontSize: 11, padding: "4px 12px", borderRadius: 99,
                    background: "#F1F5F9", color: "#475569", fontWeight: 500
                  }}>#{tag}</span>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Back link bottom */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          <Link href="/news" style={{
            fontSize: 13, color: "#0B1D3A", textDecoration: "none",
            fontWeight: 500
          }}>
            ← Back to all news
          </Link>
        </div>

      </div>
    </MainLayout>
  )
}