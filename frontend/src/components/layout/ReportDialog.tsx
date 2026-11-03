"use client"

import { useState } from "react"

export type ReportReasonValue = "SPAM" | "HARASSMENT" | "INAPPROPRIATE" | "OTHER"

const REASONS: { value: ReportReasonValue; label: string }[] = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment or abuse" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "OTHER", label: "Something else" }
]

interface Props {
  title: string
  intro: string
  preview?: string
  onClose: () => void
  onSubmit: (reason: ReportReasonValue, details: string) => Promise<void>
}

export default function ReportDialog({ title, intro, preview, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReasonValue>("INAPPROPRIATE")
  const [details, setDetails] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    setBusy(true)
    setError("")
    try {
      await onSubmit(reason, details.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the report")
      setBusy(false)
    }
  }

  const field: React.CSSProperties = {
    width: "100%", padding: "11px 12px", fontSize: 14, borderRadius: 10,
    border: "1.5px solid #E4E2DC", marginBottom: 14, fontFamily: "'Inter', sans-serif"
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 28, width: "min(460px, 100%)" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A", marginBottom: 6 }}>{title}</h2>
        <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 14, lineHeight: 1.6 }}>{intro}</p>
        {preview && (
          <p style={{ fontSize: 13, color: "#374151", background: "#F8F7F4", padding: "10px 14px", borderRadius: 8, marginBottom: 16, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            &ldquo;{preview.slice(0, 200)}{preview.length > 200 ? "..." : ""}&rdquo;
          </p>
        )}

        {error && <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 14, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0B1D3A", marginBottom: 6 }}>What is wrong with it?</label>
        <select value={reason} onChange={e => setReason(e.target.value as ReportReasonValue)} style={field}>
          {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>

        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0B1D3A", marginBottom: 6 }}>More details (optional)</label>
        <textarea value={details} onChange={e => setDetails(e.target.value)} maxLength={1000} rows={3} style={{ ...field, marginBottom: 20, resize: "vertical" }} />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1.5px solid #E4E2DC", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151", fontFamily: "'Inter', sans-serif" }}>Cancel</button>
          <button onClick={submit} disabled={busy}
            style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: busy ? "#8A9BC0" : "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif" }}>
            {busy ? "Sending..." : "Send report"}
          </button>
        </div>
      </div>
    </div>
  )
}