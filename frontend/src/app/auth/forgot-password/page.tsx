"use client"

import { useState } from "react"
import Link from "next/link"
import AuthShell, { inputStyle, labelStyle, primaryButton, errorBox, successBox, linkStyle } from "@/components/layout/AuthShell"
import { requestPasswordReset } from "@/lib/authApi"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      setMessage(await requestPasswordReset(email.trim()))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your university email and we will send you a reset link">
      {error && <div style={errorBox}>{error}</div>}
      {message && <div style={successBox}>{message}</div>}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>University email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={primaryButton(loading)}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13 }}>
        <Link href="/auth/login" style={linkStyle}>Back to sign in</Link>
      </p>
    </AuthShell>
  )
}