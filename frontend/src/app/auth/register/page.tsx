"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthShell, { inputStyle, labelStyle, primaryButton, errorBox, successBox, linkStyle } from "@/components/layout/AuthShell"
import PasswordField from "@/components/layout/PasswordField"
import { registerAccount } from "@/lib/authApi"

const DRAFT_KEY = "uniarena-register-draft"

type Draft = { name: string; studentId: string; email: string; faculty: string }
const emptyDraft: Draft = { name: "", studentId: "", email: "", faculty: "" }

export default function RegisterPage() {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [restored, setRestored] = useState(false)

  // Restore the typed details when the page is reopened (for example after reading the policies)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY)
      // Restoring from sessionStorage can only happen after mount (it does not exist on the server)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setDraft({ ...emptyDraft, ...JSON.parse(saved) })
    } catch {
      // Ignore a damaged draft
    }
    setRestored(true)
  }, [])

  // Save only the non-secret fields, and only after the restore has run
  useEffect(() => {
    if (!restored) return
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      // Storage may be unavailable (private mode); the form still works
    }
  }, [draft, restored])

  const set = (k: keyof Draft) => (value: string) => setDraft(d => ({ ...d, [k]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!accepted) return setError("Please read and accept the Terms and Data Policy to continue")
    if (password !== confirm) return setError("Passwords do not match")
    setLoading(true)
    try {
      await registerAccount({
        name: draft.name,
        studentId: draft.studentId,
        email: draft.email,
        faculty: draft.faculty || undefined,
        password,
        acceptedPolicy: true
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
      return
    }

    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      // Nothing to clear
    }

    const result = await signIn("credentials", { email: draft.email.trim(), password, redirect: false })
    if (result?.error) {
      setCreated(true)
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  if (created) {
    return (
      <AuthShell title="Account created" subtitle="Your UniArena account is ready.">
        <div style={successBox}>Your account was created, but we couldn&apos;t sign you in automatically. Please sign in.</div>
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
          <input value={draft.name} onChange={e => set("name")(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Registration number</label>
          <input value={draft.studentId} onChange={e => set("studentId")(e.target.value)} placeholder="BSCCS/2024/30303" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>University email</label>
          <input type="email" value={draft.email} onChange={e => set("email")(e.target.value)} placeholder="bsccs202430303@mylife.mku.ac.ke" required autoComplete="username" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Faculty (optional)</label>
          <input value={draft.faculty} onChange={e => set("faculty")(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password (at least 8 characters)</label>
          <PasswordField value={password} onChange={setPassword} required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <label style={labelStyle}>Confirm password</label>
          <PasswordField value={confirm} onChange={setConfirm} required autoComplete="new-password" />
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#374151", lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} style={{ marginTop: 3 }} />
          <span>
            I have read and accept the{" "}
            <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" style={linkStyle}>Terms of Use</Link> and the{" "}
            <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>Data Policy</Link>.
          </span>
        </label>

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