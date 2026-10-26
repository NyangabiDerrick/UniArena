"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthShell, { inputStyle, labelStyle, primaryButton, errorBox, linkStyle } from "@/components/layout/AuthShell"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email: email.trim(), password, redirect: false })
    if (result?.error) {
      setError(result.error === "CredentialsSignin" ? "Invalid email or password" : result.error)
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in with your university email to continue">
      {error && <div style={errorBox}>{error}</div>}

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>University Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="bsccs202430303@mylife.mku.ac.ke" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" required style={inputStyle} />
        </div>
        <button type="submit" disabled={loading} style={primaryButton(loading)}>
          {loading ? "Signing in..." : "Sign in to UniArena"}
        </button>
      </form>

      <div style={{ marginTop: 20, fontSize: 13, color: "#6B6962", display: "flex", flexDirection: "column", gap: 8 }}>
        <Link href="/auth/forgot-password" style={linkStyle}>Forgot your password?</Link>
        <span>New to UniArena? <Link href="/auth/register" style={linkStyle}>Create an account</Link></span>
      </div>
    </AuthShell>
  )
}