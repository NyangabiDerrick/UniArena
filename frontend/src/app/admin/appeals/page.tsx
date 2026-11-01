"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Scale } from "lucide-react"
import { getAppeals, decideAppeal, type AppealItem } from "@/lib/adminAppealsApi"

const reasonLabel: Record<string, string> = {
  SPAM: "Spam", HARASSMENT: "Harassment or abuse", INAPPROPRIATE: "Inappropriate content", OTHER: "Something else"
}

const when = (d: string) =>
  new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

export default function AppealsPage() {
  const { status } = useSession()
  const [tab, setTab] = useState<"OPEN" | "APPROVED" | "REJECTED">("OPEN")
  const [appeals, setAppeals] = useState<AppealItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  const load = useCallback(() => {
    getAppeals(tab)
      .then(setAppeals)
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load appeals"))
      .finally(() => setLoading(false))
  }, [tab])

  useEffect(() => {
    if (status !== "authenticated") return
    load()
  }, [status, load, reloadKey])

  const decide = async (a: AppealItem, action: "APPROVE" | "REJECT") => {
    const note = (notes[a.id] || "").trim()
    setError("")
    setNotice("")
    if (action === "REJECT" && note.length < 5) {
      setError("Write a short reason first. The person will see it when they try again.")
      return
    }
    try {
      await decideAppeal(a.id, action, note)
      setNotice(action === "APPROVE" ? `${a.user.name}'s account was restored.` : "Appeal declined.")
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
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Suspension appeals</h1>
        <p style={{ fontSize: 14, color: "#6B6962" }}>Approving restores the account straight away. A decline needs a written reason.</p>
      </div>

      {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
      {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

      <div style={{ display: "flex", gap: 4, background: "#F3F4F6", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 24 }}>
        <button style={tabBtn("OPEN")} onClick={() => { setLoading(true); setTab("OPEN") }}>Open</button>
        <button style={tabBtn("APPROVED")} onClick={() => { setLoading(true); setTab("APPROVED") }}>Approved</button>
        <button style={tabBtn("REJECTED")} onClick={() => { setLoading(true); setTab("REJECTED") }}>Declined</button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
      ) : appeals.length === 0 ? (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 56, textAlign: "center" }}>
          <Scale size={36} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "#6B6962" }}>{tab === "OPEN" ? "No appeals waiting." : "Nothing here."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {appeals.map(a => (
            <div key={a.id} style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 4 }}>
                  {a.user.name} <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 12 }}>{a.user.studentId}</span>
                </p>
                <p style={{ fontSize: 12, color: "#6B6962" }}>{a.user.email} · Appealed {when(a.createdAt)}</p>
              </div>

              <p style={{ fontSize: 14, color: "#374151", background: "#F8F7F4", padding: "12px 16px", borderRadius: 10, marginBottom: 16, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {a.message}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#6B6962", marginBottom: 8 }}>WARNINGS ({a.user.warnings.length})</p>
                  {a.user.warnings.length === 0 ? (
                    <p style={{ fontSize: 12, color: "#9CA3AF" }}>None</p>
                  ) : a.user.warnings.map((w, i) => (
                    <p key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 6, lineHeight: 1.5 }}>
                      {w.message} <span style={{ color: "#9CA3AF" }}>({when(w.createdAt)})</span>
                    </p>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#6B6962", marginBottom: 8 }}>RECENT UPHELD REPORTS</p>
                  {a.user.reportsAgainst.length === 0 ? (
                    <p style={{ fontSize: 12, color: "#9CA3AF" }}>None</p>
                  ) : a.user.reportsAgainst.map((r, i) => (
                    <p key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 6, lineHeight: 1.5 }}>
                      {reasonLabel[r.reason] || r.reason}{r.resolution ? `: ${r.resolution}` : ""}
                    </p>
                  ))}
                </div>
              </div>

              {a.status === "OPEN" ? (
                <>
                  <input placeholder="Reason or note (required to decline; the person sees it)" value={notes[a.id] || ""} maxLength={500}
                    onChange={e => setNotes(prev => ({ ...prev, [a.id]: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8, border: "1.5px solid #E4E2DC", outline: "none", marginBottom: 12, fontFamily: "'Inter', sans-serif" }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => decide(a, "APPROVE")} style={actionBtn("#16A34A", "white")}>Approve and restore</button>
                    <button onClick={() => decide(a, "REJECT")} style={actionBtn("#DC2626", "white")}>Decline</button>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 12, color: "#6B6962" }}>
                  {a.status === "APPROVED" ? "Approved" : "Declined"}{a.decidedAt ? ` · ${when(a.decidedAt)}` : ""}{a.decision ? `. ${a.decision}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}