"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft, Pin, Trash2 } from "lucide-react"
import { api, type DiscussionPost } from "@/lib/api"
import { errorMessage } from "@/lib/types"

const card: React.CSSProperties = { background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 22 }
const input: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif", background: "white" }
const primary: React.CSSProperties = { padding: "10px 18px", borderRadius: 10, border: "none", background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }
const when = (d: string) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

export default function ClubDiscussionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { status } = useSession()
  const [posts, setPosts] = useState<DiscussionPost[]>([])
  const [canModerate, setCanModerate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (status !== "authenticated") return
    let cancelled = false
    api.getDiscussions(id)
      .then(res => {
        if (cancelled) return
        setPosts(res.data.posts)
        setCanModerate(res.data.canModerate)
        setError("")
      })
      .catch(err => { if (!cancelled) setError(errorMessage(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id, status, reloadKey])

  const post = async (e: React.FormEvent) => {
    e.preventDefault()
    setPosting(true)
    setError("")
    setNotice("")
    try {
      await api.createDiscussion(id, { title: title.trim(), content: content.trim() })
      setTitle("")
      setContent("")
      setNotice("Posted")
      setReloadKey(k => k + 1)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setPosting(false)
    }
  }

  const pin = async (p: DiscussionPost) => {
    try {
      await api.togglePinDiscussion(id, p.id)
      setReloadKey(k => k + 1)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const remove = async (p: DiscussionPost) => {
    if (!window.confirm(`Delete "${p.title}"?`)) return
    try {
      await api.deleteDiscussion(id, p.id)
      setNotice("Post deleted")
      setReloadKey(k => k + 1)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <Link href={`/clubs/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B6962", textDecoration: "none" }}>
          <ArrowLeft size={15} /> Back to club
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A" }}>Discussions</h1>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        {!loading && !error && (
          <form onSubmit={post} style={{ ...card, display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} required minLength={2} maxLength={120} placeholder="Title" style={input} />
            <textarea value={content} onChange={e => setContent(e.target.value)} required maxLength={2000} rows={3} placeholder="Share something with the club" style={{ ...input, resize: "vertical" }} />
            <div>
              <button type="submit" disabled={posting} style={{ ...primary, opacity: posting ? 0.6 : 1 }}>{posting ? "Posting..." : "Post"}</button>
            </div>
          </form>
        )}

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : posts.length === 0 && !error ? (
          <div style={{ ...card, textAlign: "center", padding: 40, color: "#6B6962", fontSize: 14 }}>No posts yet. Start the conversation.</div>
        ) : (
          posts.map(p => (
            <div key={p.id} style={{ ...card, borderColor: p.isPinned ? "#E8D89A" : "#E4E2DC", background: p.isPinned ? "#FFFBF0" : "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A" }}>
                    {p.isPinned && <span style={{ marginRight: 6, color: "#C9A84C" }}>📌</span>}{p.title}
                  </p>
                  <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{p.user.name} · {when(p.createdAt)}</p>
                </div>
                {canModerate && (
                  <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                    <button onClick={() => pin(p)} title={p.isPinned ? "Unpin" : "Pin"} style={{ background: "none", border: "none", cursor: "pointer", color: "#6B6962" }}>
                      <Pin size={15} />
                    </button>
                    <button onClick={() => remove(p)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{p.content}</p>
            </div>
          ))
        )}
      </div>
    </MainLayout>
  )
}