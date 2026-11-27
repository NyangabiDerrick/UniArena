"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { downloadMyData, deleteMyAccount } from "@/lib/privacyApi"
import { errorMessage } from "@/lib/types"

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 28, border: "1px solid #E4E2DC", marginTop: 24 }
const input: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif", background: "white", marginBottom: 10 }
const button: React.CSSProperties = { padding: "10px 18px", borderRadius: 10, border: "1.5px solid #E4E2DC", background: "white", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif" }

// Lets a person see, take and remove the data UniArena holds about them
export default function YourDataCard({ canDelete }: { canDelete: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [password, setPassword] = useState("")

  const download = async () => {
    setBusy(true); setError(""); setNotice("")
    try {
      await downloadMyData()
      setNotice("Your data was downloaded as a file.")
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true); setError("")
    try {
      await deleteMyAccount(password)
      await signOut({ callbackUrl: "/auth/login" })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div style={card}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 8 }}>Your data</h2>
      <p style={{ fontSize: 13, color: "#6B6962", lineHeight: 1.6, marginBottom: 16 }}>
        Download a copy of everything UniArena holds about you, including your messages, tickets and memberships.
        {canDelete ? " You can also delete your account and the data tied to it." : " Leader and administrator accounts are removed by an administrator."}
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button onClick={download} disabled={busy} style={button}>Download my data</button>
        {canDelete && !confirming && (
          <button onClick={() => setConfirming(true)} style={{ ...button, color: "#DC2626", borderColor: "#FECACA" }}>Delete my account</button>
        )}
      </div>

      {confirming && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #F3F4F6" }}>
          <p style={{ fontSize: 13, color: "#B91C1C", marginBottom: 10 }}>
            This permanently deletes your account, memberships, tickets and messages. It cannot be undone. Enter your password to confirm.
          </p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" style={input} />
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={remove} disabled={busy || !password} style={{ ...button, background: "#DC2626", color: "white", border: "none" }}>
              {busy ? "Deleting..." : "Delete everything"}
            </button>
            <button onClick={() => { setConfirming(false); setPassword("") }} style={{ ...button, border: "none" }}>Cancel</button>
          </div>
        </div>
      )}

      {notice && <p style={{ fontSize: 13, color: "#15803D", marginTop: 12 }}>{notice}</p>}
      {error && <p style={{ fontSize: 13, color: "#DC2626", marginTop: 12 }}>{error}</p>}
    </div>
  )
}
