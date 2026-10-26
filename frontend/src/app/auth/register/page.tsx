"use client"

import { useState } from "react"
import Link from "next/link"
import AuthShell, { inputStyle, labelStyle, primaryButton, errorBox, successBox, linkStyle } from "@/components/layout/AuthShell"
import { registerAccount } from "@/lib/authApi"

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", studentId: "", email: "", faculty: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirm) return setError("Passwords do not match")
    setLoading(true)
    try {
      await registerAccount({
        name: form.name, studentId: form.studentId, email: form.email,
        faculty: form.faculty || undefined, password: form.password
      })
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <AuthShell title="Account created" subtitle="Your UniArena account is ready.">
        <div style={successBox}>You can now sign in with your university email and password.</div>
        <Link href="/auth/login" style={linkStyle}>Go to sign in</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Create your account" subtitle="Use your Mount Kenya University student email">
      {error && <div style={errorBox}>{error}</div>}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>Full name</label>
          <input value={form.name} onChange={set("name")} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Registration number</label>
          <input value={form.studentId} onChange={set("studentId")} placeholder="BSCCS/2024/30303" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>University email</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="bsccs202430303@mylife.mku.ac.ke" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Faculty (optional)</label>
          <input value={form.faculty} onChange={set("faculty")} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password (at least 8 characters)</label>
          <input type="password" value={form.password} onChange={set("password")} required minLength={8} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirm password</label>
          <input type="password" value={form.confirm} onChange={set("confirm")} required style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={primaryButton(loading)}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 13, color: "#6B6962" }}>
        Already have an account? <Link href="/auth/login" style={linkStyle}>Sign in</Link>
      </p>
    </AuthShell>
  )
}