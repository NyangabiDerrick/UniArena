"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import ReportDialog from "@/components/layout/ReportDialog"
import { ArrowLeft, Calendar, Clock, User, Flag } from "lucide-react"
import {
  getArticleWithComments, postComment, reportComment,
  type ArticleDetail, type ArticleComment
} from "@/lib/commentsApi"
import { reportArticle } from "@/lib/reportContentApi"

const dateOf = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
const stamp = (d: string) =>
  new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { status } = useSession()
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState("")
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [reportingComment, setReportingComment] = useState<ArticleComment | null>(null)
  const [reportingArticle, setReportingArticle] = useState(false)

  useEffect(() => {
    let cancelled = false
    getArticleWithComments(id)
      .then(a => { if (!cancelled) setArticle(a) })
      .catch(() => { if (!cancelled) setArticle(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const post = async () => {
    const content = text.trim()
    if (!content || posting) return
    setPosting(true)
    setError("")
    try {
      const comment = await postComment(id, content)
      setArticle(a => (a ? { ...a, comments: [comment, ...a.comments] } : a))
      setText("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post your comment")
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p></MainLayout>
  }

  if (!article) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 12 }}>Article not found</p>
          <Link href="/news" style={{ fontSize: 13, color: "#0B1D3A", textDecoration: "underline" }}>Back to News</Link>
        </div>
      </MainLayout>
    )
  }

  const source = article.club?.name || (article.isUniversityWide ? "University" : "UniArena")
  const readTime = Math.max(1, Math.ceil(article.content.length / 1000))

  return (
    <MainLayout>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/news" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B6962", textDecoration: "none", marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to News
        </Link>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}

        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E4E2DC", padding: "36px 40px", boxShadow: "0 4px 20px rgba(11,29,58,0.06)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>{source}</span>
            {status === "authenticated" && (
              <button onClick={() => { setReportingArticle(true); setNotice("") }} aria-label="Report this article"
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>
                <Flag size={12} /> Report
              </button>
            )}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", lineHeight: 1.3, margin: "10px 0 20px" }}>{article.title}</h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, paddingBottom: 24, marginBottom: 28, borderBottom: "1px solid #E4E2DC", fontSize: 13, color: "#9CA3AF" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><User size={14} />{article.author?.name || "UniArena"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar size={14} />{dateOf(article.createdAt)}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} />{readTime} min read</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {article.content.split("\n\n").map((p, i) =>
              p.trim() ? <p key={i} style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, margin: 0 }}>{p.trim()}</p> : null
            )}
          </div>

          {article.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32, paddingTop: 22, borderTop: "1px solid #E4E2DC" }}>
              {article.tags.map(t => (
                <span key={t} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "#F1F5F9", color: "#475569", fontWeight: 500 }}>#{t}</span>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E4E2DC", padding: "28px 32px" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 18 }}>
            Comments ({article.comments.length})
          </h2>

          {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

          <textarea value={text} onChange={e => setText(e.target.value)} maxLength={1000} rows={3} placeholder="Add a comment..."
            style={{ width: "100%", padding: "12px 14px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif", resize: "vertical", marginBottom: 10 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{text.length}/1000. Please keep it respectful.</span>
            <button onClick={post} disabled={!text.trim() || posting}
              style={{ padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif",
                background: text.trim() && !posting ? "#0B1D3A" : "#E4E2DC", color: text.trim() && !posting ? "white" : "#9CA3AF",
                cursor: text.trim() && !posting ? "pointer" : "not-allowed" }}>
              {posting ? "Posting..." : "Post comment"}
            </button>
          </div>

          {article.comments.length === 0 ? (
            <p style={{ fontSize: 14, color: "#6B6962", textAlign: "center", padding: "20px 0" }}>No comments yet. Be the first.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {article.comments.map((c, i) => (
                <div key={c.id} style={{ display: "flex", gap: 12, padding: "16px 0", borderTop: i === 0 ? "1px solid #F3F4F6" : "none", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                    {c.user.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>
                        {c.user.name} <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 11, marginLeft: 6 }}>{stamp(c.createdAt)}</span>
                      </p>
                      <button onClick={() => { setReportingComment(c); setNotice("") }} aria-label="Report this comment"
                        style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#9CA3AF", fontFamily: "'Inter', sans-serif" }}>
                        <Flag size={12} /> Report
                      </button>
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {reportingComment && (
        <ReportDialog
          title="Report this comment"
          intro={`An administrator will review the comment by ${reportingComment.user.name}.`}
          preview={reportingComment.content}
          onClose={() => setReportingComment(null)}
          onSubmit={async (reason, details) => {
            await reportComment(reportingComment.id, reason, details)
            setNotice("Report sent. An administrator will review it.")
            setReportingComment(null)
          }}
        />
      )}

      {reportingArticle && (
        <ReportDialog
          title="Report this article"
          intro="An administrator will review the article. The author isn't told who reported it."
          preview={article.title}
          onClose={() => setReportingArticle(false)}
          onSubmit={async (reason, details) => {
            setNotice(await reportArticle(id, reason, details))
            setReportingArticle(false)
          }}
        />
      )}
    </MainLayout>
  )
}