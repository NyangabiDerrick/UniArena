"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Flag } from "lucide-react"
import { getReports, decideReport, type Report, type ReportAction } from "@/lib/adminReportsApi"

const reasonLabel: Record<string, string> = {
  SPAM: "Spam", HARASSMENT: "Harassment or abuse", INAPPROPRIATE: "Inappropriate content", OTHER: "Something else"
}

const typeLabel: Record<string, string> = { MESSAGE: "Message", COMMENT: "Comment", EVENT: "Event", ARTICLE: "Article" }
const takedownWord: Record<string, string> = { COMMENT: "comment", EVENT: "event", ARTICLE: "article" }

const when = (d: string) =>
  new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<"OPEN" | "RESOLVED" | "DISMISSED">("OPEN")
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [removeFlags, setRemoveFlags] = useState<Record<string, boolean>>({})
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const isAdmin = session?.user?.role === "ADMIN"

  const load = useCallback(() => {
    getReports(tab)
      .then(setReports)
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load reports"))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    if (status !== "authenticated") return
    load()
  }, [status, load, reloadKey])

  const decide = async (r: Report, action: ReportAction) => {
    const note = (notes[r.id] || "").trim()
    setError("")
    setNotice("")

    if (action === "WARN" && note.length < 5) {
      setError("Write a note first. The person will see it in their warning.")
      return
    }
    if (action === "SUSPEND" && !window.confirm(`Suspend ${r.reported.name}? They will be signed out and unable to sign in. They can appeal.`)) return

    const canTakeDown = r.targetType in takedownWord
    try {
      await decideReport(r.id, action, note, canTakeDown ? (removeFlags[r.id] ?? true) : false)
      setNotice(
        action === "DISMISS" ? "Report dismissed."
        : action === "SUSPEND" ? `${r.reported.name} was suspended.`
        : action === "WARN" ? `${r.reported.name} was warned.`
        : "Report resolved."
      )
      setReloadKey(k => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed")
    }
  }

  const tabBtn = (key: typeof tab): React.CSSProperties => ({
    padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    background: tab === key ? "white" : "transparent", color: tab === key ? "#0B1D3A" : "#6B6962",
    boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none"
  })

  const actionBtn = (bg: string, color: string): React.CSSProperties => ({
    padding: "9px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: bg, color,
    fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif"
  })

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Reports</h1>
        <p style={{ fontSize: 14, color: "#6B6962" }}>You see only the reported content and the last few messages involved.</p>
      </div>

      {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
      {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

      <div style={{ display: "flex", gap: 4, background: "#F3F4F6", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 24 }}>
        <button style={tabBtn("OPEN")} onClick={() => { setLoading(true); setTab("OPEN") }}>Open</button>
        <button style={tabBtn("RESOLVED")} onClick={() => { setLoading(true); setTab("RESOLVED") }}>Resolved</button>
        <button style={tabBtn("DISMISSED")} onClick={() => { setLoading(true); setTab("DISMISSED") }}>Dismissed</button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
      ) : reports.length === 0 ? (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 56, textAlign: "center" }}>
          <Flag size={36} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "#6B6962" }}>{tab === "OPEN" ? "No open reports." : "Nothing here."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {reports.map(r => (
            <div key={r.id} style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 4 }}>
                    {r.reported.name} <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 12 }}>{r.reported.studentId}</span>
                    {!r.reported.isActive && <span style={{ marginLeft: 8, fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#FEF2F2", color: "#DC2626" }}>Suspended</span>}
                  </p>
                  <p style={{ fontSize: 12, color: "#6B6962" }}>Reported by {r.reporter.name} · {when(r.createdAt)}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignSelf: "flex-start", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "#EFF6FF", color: "#1D4ED8", fontWeight: 500 }}>
                    {typeLabel[r.targetType] ?? r.targetType}
                  </span>
                  <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "#FFF7ED", color: "#C2410C", fontWeight: 500 }}>
                    {reasonLabel[r.reason] || r.reason}
                  </span>
                </div>
              </div>

              {r.warningCount > 0 && (
                <p style={{
                  fontSize: 12, fontWeight: 500, padding: "8px 12px", borderRadius: 8, marginBottom: 14,
                  background: r.warningCount >= 3 ? "#FEF2F2" : "#FFFBEB",
                  color: r.warningCount >= 3 ? "#991B1B" : "#92400E"
                }}>
                  {r.warningCount} previous warning{r.warningCount > 1 ? "s" : ""} for this person.
                  {r.warningCount >= 3 ? " You may want to consider suspension." : ""}
                </p>
              )}

              {r.details && <p style={{ fontSize: 13, color: "#374151", background: "#F8F7F4", padding: "10px 14px", borderRadius: 8, marginBottom: 14, lineHeight: 1.6 }}>&ldquo;{r.details}&rdquo;</p>}

              <div style={{ background: "#F8F7F4", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {r.evidence.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.from === "reported" ? "flex-start" : "flex-end" }}>
                    <div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: 10, background: m.from === "reported" ? "#FEF2F2" : "white", border: "1px solid #E4E2DC" }}>
                      {m.context && <p style={{ fontSize: 10, color: "#6B6962", marginBottom: 4, fontStyle: "italic" }}>{m.context}</p>}
                      <p style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>{m.from === "reported" ? r.reported.name : r.reporter.name} · {when(m.sentAt)}</p>
                      <p style={{ fontSize: 13, color: "#1A1916", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {r.status === "OPEN" ? (
                <>
                  <input placeholder="Note (required for a warning; the person sees it)" value={notes[r.id] || ""} maxLength={500}
                    onChange={e => setNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: "1.5px solid #E4E2DC", outline: "none", marginBottom: 12, fontFamily: "'Inter', sans-serif" }} />

                  {r.targetType in takedownWord && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginBottom: 14, cursor: "pointer" }}>
                      <input type="checkbox" checked={removeFlags[r.id] ?? true}
                        onChange={e => setRemoveFlags(prev => ({ ...prev, [r.id]: e.target.checked }))} />
                      Also take this {takedownWord[r.targetType]} down (when warning, resolving or suspending)
                    </label>
                  )}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={() => decide(r, "DISMISS")} style={actionBtn("#F3F4F6", "#374151")}>Dismiss</button>
                    <button onClick={() => decide(r, "RESOLVE")} style={actionBtn("#0B1D3A", "white")}>Mark resolved</button>
                    {r.reported.role !== "ADMIN" && (
                      <button onClick={() => decide(r, "WARN")} style={actionBtn("#C9A84C", "#0B1D3A")}>Warn</button>
                    )}
                    {isAdmin && r.reported.role !== "ADMIN" && r.reported.isActive && (
                      <button onClick={() => decide(r, "SUSPEND")} style={actionBtn("#DC2626", "white")}>Suspend account</button>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 12, color: "#6B6962" }}>{r.resolution}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}