"use client"

import { useState } from "react"
import Link from "next/link"
import AuthShell, { inputStyle, labelStyle, primaryButton, errorBox, successBox, linkStyle } from "@/components/layout/AuthShell"
import { submitAppeal } from "@/lib/appealApi"

export default function AppealPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      setDone(await submitAppeal(email, password, message))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Appeal sent" subtitle="An administrator will review your appeal.">
        <div style={successBox}>{done} Try signing in again later. If your appeal is approved, your account works again.</div>
        <Link href="/auth/login" style={linkStyle}>Back to sign in</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Appeal your suspension" subtitle="Sign in details prove the account is yours. Explain why the decision should change.">
      {error && <div style={errorBox}>{error}</div>}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>University email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Your appeal</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} required minLength={10} maxLength={1500} rows={5}
            placeholder="Explain what happened and why your account should be restored."
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <button type="submit" disabled={loading} style={primaryButton(loading)}>
          {loading ? "Sending..." : "Send appeal"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13 }}>
        <Link href="/auth/login" style={linkStyle}>Back to sign in</Link>
      </p>
    </AuthShell>
  )
}