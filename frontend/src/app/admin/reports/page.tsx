"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Flag } from "lucide-react"
import { getReports, decideReport, type Report } from "@/lib/adminReportsApi"

const reasonLabel: Record<string, string> = {
  SPAM: "Spam", HARASSMENT: "Harassment or abuse", INAPPROPRIATE: "Inappropriate content", OTHER: "Something else"
}

const when = (d: string) =>
  new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<"OPEN" | "RESOLVED" | "DISMISSED">("OPEN")
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
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

  const decide = async (r: Report, action: "DISMISS" | "RESOLVE" | "SUSPEND") => {
    if (action === "SUSPEND" && !window.confirm(`Suspend ${r.reported.name}? They will be signed out and unable to sign in.`)) return
    setError("")
    setNotice("")
    try {
      await decideReport(r.id, action, notes[r.id]?.trim())
      setNotice(action === "DISMISS" ? "Report dismissed." : action === "SUSPEND" ? `${r.reported.name} was suspended.` : "Report resolved.")
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
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Message reports</h1>
        <p style={{ fontSize: 14, color: "#6B6962" }}>You see only the last few messages between the two people involved.</p>
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
                <span style={{ alignSelf: "flex-start", fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "#FFF7ED", color: "#C2410C", fontWeight: 500 }}>
                  {reasonLabel[r.reason] || r.reason}
                </span>
              </div>

              {r.details && <p style={{ fontSize: 13, color: "#374151", background: "#F8F7F4", padding: "10px 14px", borderRadius: 8, marginBottom: 14, lineHeight: 1.6 }}>&ldquo;{r.details}&rdquo;</p>}

              <div style={{ background: "#F8F7F4", borderRadius: 10, padding: 14, marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {r.evidence.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.from === "reported" ? "flex-start" : "flex-end" }}>
                    <div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: 10, background: m.from === "reported" ? "#FEF2F2" : "white", border: "1px solid #E4E2DC" }}>
                      <p style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2 }}>{m.from === "reported" ? r.reported.name : r.reporter.name} · {when(m.sentAt)}</p>
                      <p style={{ fontSize: 13, color: "#1A1916", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {r.status === "OPEN" ? (
                <>
                  <input placeholder="Note for the record (optional)" value={notes[r.id] || ""} maxLength={500}
                    onChange={e => setNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: "1.5px solid #E4E2DC", outline: "none", marginBottom: 12, fontFamily: "'Inter', sans-serif" }} />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={() => decide(r, "DISMISS")} style={actionBtn("#F3F4F6", "#374151")}>Dismiss</button>
                    <button onClick={() => decide(r, "RESOLVE")} style={actionBtn("#0B1D3A", "white")}>Mark resolved</button>
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