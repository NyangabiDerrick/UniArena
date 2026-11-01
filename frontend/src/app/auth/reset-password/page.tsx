"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import AuthShell, { inputStyle, labelStyle, primaryButton, errorBox, successBox, linkStyle } from "@/components/layout/AuthShell"
import { resetPassword } from "@/lib/authApi"
import { errorMessage } from "@/lib/types"

function ResetPasswordForm() {
  const token = useSearchParams().get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password !== confirm) return setError("Passwords do not match")
    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="Your password has been changed.">
        <div style={successBox}>You can now sign in with your new password.</div>
        <Link href="/auth/login" style={linkStyle}>Go to sign in</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick a password of at least 8 characters">
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirm new password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={inputStyle} />
        </div>
        <button type="submit" disabled={loading || !token} style={primaryButton(loading || !token)}>
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
    </AuthShell>
  )
}


export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
