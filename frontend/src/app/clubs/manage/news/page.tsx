"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import MainLayout from "@/components/layout/MainLayout"
import { FileX, X } from "lucide-react"
import { getManagedArticles, changeArticle, type ManagedArticle, type ArticleAction } from "@/lib/articleModerationApi"

const when = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

const field: React.CSSProperties = {
  width: "100%", padding: "11px 12px", fontSize: 14, borderRadius: 10,
  border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif"
}

const badge = (bg: string, text: string): React.CSSProperties => ({
  fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: bg, color: text
})

const btn = (color: string): React.CSSProperties => ({
  padding: "7px 12px", borderRadius: 8, border: "1.5px solid #E4E2DC", background: "white",
  cursor: "pointer", color, fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif"
})

export default function ManageNewsPage() {
  const { data: session, status } = useSession()
  const [articles, setArticles] = useState<ManagedArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [acting, setActing] = useState<{ article: ManagedArticle; action: "hide" | "remove" } | null>(null)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [modalError, setModalError] = useState("")

  const role = session?.user?.role
  const isAdmin = role === "ADMIN"
  const permitted = isAdmin || role === "CLUB_LEADER"

  useEffect(() => {
    if (status !== "authenticated" || !permitted) return
    let cancelled = false
    getManagedArticles()
      .then(list => { if (!cancelled) setArticles(list) })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load articles") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [status, permitted, reloadKey])

  const restore = async (a: ManagedArticle) => {
    setNotice("")
    setError("")
    try {
      setNotice(await changeArticle(a.id, "restore"))
      setReloadKey(k => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed")
    }
  }

  const confirmAction = async () => {
    if (!acting) return
    if (reason.trim().length < 5) return setModalError("Give a reason of at least 5 characters")
    setBusy(true)
    setModalError("")
    try {
      setNotice(await changeArticle(acting.article.id, acting.action as ArticleAction, reason.trim()))
      setError("")
      setActing(null)
      setReason("")
      setReloadKey(k => k + 1)
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Action failed")
    } finally {
      setBusy(false)
    }
  }

  const open = (article: ManagedArticle, action: "hide" | "remove") => {
    setActing({ article, action })
    setReason("")
    setModalError("")
  }

  if (status === "authenticated" && !permitted) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only club leaders and administrators can manage news.</p></MainLayout>
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Manage news</h1>
            <p style={{ fontSize: 14, color: "#6B6962" }}>
              {isAdmin ? "Every article on campus." : "Articles of your group."} Hiding takes an article off the News page until you restore it.
            </p>
          </div>
          <Link href="/clubs/manage/post-news" style={{ padding: "10px 18px", borderRadius: 10, background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Post news
          </Link>
        </div>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        {loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : articles.length === 0 ? (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 56, textAlign: "center" }}>
            <FileX size={36} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "#6B6962" }}>No articles yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {articles.map(a => {
              const locked = !isAdmin && a.removedByAdmin
              const group = a.club?.name || a.team?.name || "University"
              return (
                <div key={a.id} style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        {a.status === "PUBLISHED" && <span style={badge("#F0FDF4", "#15803D")}>Published</span>}
                        {a.status === "HIDDEN" && <span style={badge("#FFFBEB", "#92400E")}>{a.removedByAdmin ? "Hidden by an administrator" : "Hidden"}</span>}
                        {a.status === "REMOVED" && <span style={badge("#FEF2F2", "#DC2626")}>{a.removedByAdmin ? "Removed by an administrator" : "Removed"}</span>}
                        {a.status === "PENDING" && <span style={badge("#EFF6FF", "#1D4ED8")}>Pending</span>}
                        <span style={badge("#F1F5F9", "#475569")}>{group}</span>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 4 }}>{a.title}</p>
                      <p style={{ fontSize: 12, color: "#9CA3AF" }}>{a.author?.name || "Unknown"} · {when(a.createdAt)}</p>
                      {a.moderationNote && (a.status === "HIDDEN" || a.status === "REMOVED") && (
                        <p style={{ fontSize: 12, color: "#6B6962", marginTop: 8 }}>Reason: {a.moderationNote}</p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignContent: "flex-start" }}>
                      {locked ? (
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>Only an administrator can change this</span>
                      ) : (
                        <>
                          {a.status === "PUBLISHED" && (
                            <>
                              <Link href={`/news/${a.id}`} style={{ ...btn("#0B1D3A"), textDecoration: "none" }}>View</Link>
                              <button onClick={() => open(a, "hide")} style={btn("#92400E")}>Hide</button>
                            </>
                          )}
                          {a.status !== "REMOVED" && (
                            <button onClick={() => open(a, "remove")} style={btn("#DC2626")}>Remove</button>
                          )}
                          {a.status === "HIDDEN" && <button onClick={() => restore(a)} style={btn("#15803D")}>Restore</button>}
                          {a.status === "REMOVED" && isAdmin && <button onClick={() => restore(a)} style={btn("#15803D")}>Restore</button>}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {acting && (
        <div onClick={() => setActing(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 28, width: "min(480px, 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A" }}>
                {acting.action === "hide" ? "Hide this article?" : "Remove this article?"}
              </h2>
              <button onClick={() => setActing(null)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 16, lineHeight: 1.6 }}>
              <strong>{acting.article.title}</strong>.{" "}
              {acting.action === "hide"
                ? "It disappears from the News page. You can restore it later."
                : isAdmin
                  ? "It is taken down. You can restore it later."
                  : "It is taken down. Only an administrator can bring it back."}
            </p>
            {modalError && <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 12, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{modalError}</div>}
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={500}
              placeholder="Why? This is kept in the record."
              style={{ ...field, resize: "vertical", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActing(null)} style={{ ...btn("#374151"), flex: 1, padding: 12 }}>Keep as is</button>
              <button onClick={confirmAction} disabled={busy}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: busy ? "#8A9BC0" : acting.action === "remove" ? "#DC2626" : "#92400E", color: "white", fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif" }}>
                {busy ? "Saving..." : acting.action === "hide" ? "Hide article" : "Remove article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}