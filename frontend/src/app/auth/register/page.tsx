"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import AuthShell, { inputStyle, labelStyle, primaryButton, errorBox, linkStyle } from "@/components/layout/AuthShell"
import PasswordInput from "@/components/layout/PasswordInput"
import { registerAccount } from "@/lib/authApi"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", studentId: "", email: "", faculty: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsManualSignIn, setNeedsManualSignIn] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const mismatch = form.confirm.length > 0 && form.password !== form.confirm

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setNeedsManualSignIn(false)
    if (form.password !== form.confirm) return setError("Passwords do not match")

    setLoading(true)
    try {
      await registerAccount({
        name: form.name, studentId: form.studentId, email: form.email,
        faculty: form.faculty || undefined, password: form.password
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account")
      setLoading(false)
      return
    }

    // The account exists. Sign in with the same details so there is no second login step.
    const result = await signIn("credentials", {
      email: form.email.trim(), password: form.password, redirect: false
    })
    if (result?.error) {
      setError("Your account was created, but we couldn't sign you in automatically.")
      setNeedsManualSignIn(true)
      setLoading(false)
      return
    }
    router.replace("/dashboard")
  }

  return (
    <AuthShell title="Create your account" subtitle="Use your Mount Kenya University student email">
      {error && (
        <div style={errorBox}>
          {error}
          {needsManualSignIn && (
            <div style={{ marginTop: 8 }}>
              <Link href="/auth/login" style={linkStyle}>Go to sign in</Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label htmlFor="name" style={labelStyle}>Full name</label>
          <input id="name" value={form.name} onChange={set("name")} required autoComplete="name" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="studentId" style={labelStyle}>Registration number</label>
          <input id="studentId" value={form.studentId} onChange={set("studentId")} placeholder="BSCCS/2024/30303" required style={inputStyle} />
        </div>
        <div>
          <label htmlFor="email" style={labelStyle}>University email</label>
          <input id="email" type="email" value={form.email} onChange={set("email")} placeholder="bsccs202430303@mylife.mku.ac.ke" required autoComplete="email" style={inputStyle} />
        </div>
        <div>
          <label htmlFor="faculty" style={labelStyle}>Faculty (optional)</label>
          <input id="faculty" value={form.faculty} onChange={set("faculty")} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="password" style={labelStyle}>Password (at least 8 characters)</label>
          <PasswordInput id="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="confirm" style={labelStyle}>Confirm password</label>
          <PasswordInput id="confirm" value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} autoComplete="new-password" />
          {mismatch && <p style={{ fontSize: 12, color: "#B91C1C", marginTop: 6 }}>Passwords do not match yet.</p>}
        </div>
        <button type="submit" disabled={loading} style={primaryButton(loading)}>
          {loading ? "Creating your account..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13, color: "#6B6962" }}>
        Already have an account? <Link href="/auth/login" style={linkStyle}>Sign in</Link>
      </p>
    </AuthShell>
  )
}