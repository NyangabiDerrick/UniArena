"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import AuthShell, { labelStyle, primaryButton, errorBox, successBox, linkStyle } from "@/components/layout/AuthShell"
import PasswordInput from "@/components/layout/PasswordInput"
import { resetPassword } from "@/lib/authApi"

function ResetForm() {
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
      setError(err instanceof Error ? err.message : "Could not update your password")
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
      {!token && <div style={errorBox}>This link is incomplete. Open the full link from your reset email, or request a new one.</div>}
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label htmlFor="password" style={labelStyle}>New password</label>
          <PasswordInput id="password" value={password} onChange={setPassword} minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="confirm" style={labelStyle}>Confirm new password</label>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <button type="submit" disabled={loading || !token} style={primaryButton(loading || !token)}>
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
      <p style={{ marginTop: 20, fontSize: 13 }}>
        <Link href="/auth/forgot-password" style={linkStyle}>Request a new link</Link>
      </p>
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  )
}