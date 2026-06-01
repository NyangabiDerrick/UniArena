"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const testAccounts = [
  { email: "student@university.ac", role: "Student" },
  { email: "leader@university.ac", role: "Club Leader" },
  { email: "captain@university.ac", role: "Sports Captain" },
  { email: "admin@university.ac", role: "Admin" },
  { email: "lecturer@university.ac", role: "Lecturer" },
]

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
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Invalid credentials. Please try again.")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Inter', sans-serif",
      background: "#F8F7F4"
    }}>

      {/* ── Left branding panel ── */}
      <div style={{
        width: "45%",
        minHeight: "100vh",
        background: "#0B1D3A",
        display: "flex",
        flexDirection: "column",
        padding: "40px 48px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Gold top line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#C9A84C" }} />

        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 320, height: 320, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.05)"
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: -60,
          width: 240, height: 240, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.05)"
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "auto" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#C9A84C", color: "#0B1D3A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18
          }}>U</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: "white" }}>
              UniArena
            </div>
            <div style={{ fontSize: 9, color: "#C9A84C", letterSpacing: "0.14em", marginTop: 1 }}>
              UNIVERSITY PLATFORM
            </div>
          </div>
        </div>

        {/* Main copy — vertically centred */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          <div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 40, fontWeight: 700, color: "white",
              lineHeight: 1.2, marginBottom: 16
            }}>
              Your university,<br />
              <span style={{ color: "#C9A84C" }}>all in one place.</span>
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 360 }}>
              Clubs, societies, sports teams, events and more —
              unified under one powerful platform built for modern university life.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Clubs & Societies", "Sports Teams", "Events & Tickets", "News & Media"].map(f => (
              <span key={f} style={{
                fontSize: 11, padding: "5px 12px", borderRadius: 99,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.5)"
              }}>{f}</span>
            ))}
          </div>

          {/* Quote */}
          <div style={{
            borderLeft: "3px solid #C9A84C",
            paddingLeft: 16,
            background: "rgba(255,255,255,0.04)",
            padding: "14px 16px",
            borderRadius: "0 8px 8px 0"
          }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, fontStyle: "italic" }}>
              "UniArena transformed how we manage our club. Everything we need is right here."
            </p>
            <p style={{ fontSize: 11, color: "#C9A84C", marginTop: 8, fontWeight: 500 }}>
              — Jane Leader, Photography Society President
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 32 }}>
          © 2026 UniArena. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 48px"
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Heading */}
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30, fontWeight: 700,
            color: "#0B1D3A", marginBottom: 8
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 32 }}>
            Sign in with your university credentials to continue
          </p>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 20,
              background: "#FEF2F2", color: "#991B1B",
              border: "1px solid #FECACA", fontSize: 13
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0B1D3A", marginBottom: 6 }}>
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.ac"
                required
                style={{
                  width: "100%", padding: "11px 14px",
                  fontSize: 14, borderRadius: 10,
                  border: "1.5px solid #E4E2DC",
                  background: "white", color: "#1A1916",
                  outline: "none", transition: "border 0.15s",
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = "#0B1D3A"}
                onBlur={e => e.target.style.borderColor = "#E4E2DC"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#0B1D3A", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", padding: "11px 14px",
                  fontSize: 14, borderRadius: 10,
                  border: "1.5px solid #E4E2DC",
                  background: "white", color: "#1A1916",
                  outline: "none", transition: "border 0.15s",
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = "#0B1D3A"}
                onBlur={e => e.target.style.borderColor = "#E4E2DC"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                borderRadius: 10, border: "none",
                background: loading ? "#8A9BC0" : "#0B1D3A",
                color: "white", fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.15s", letterSpacing: "0.01em",
                fontFamily: "'Inter', sans-serif"
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#152848" }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "#0B1D3A" }}
            >
              {loading ? "Signing in..." : "Sign in to UniArena"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E4E2DC" }} />
            <span style={{ fontSize: 11, color: "#6B6962" }}>Dev test accounts</span>
            <div style={{ flex: 1, height: 1, background: "#E4E2DC" }} />
          </div>

          {/* Test accounts */}
          <div style={{
            background: "#0B1D3A", borderRadius: 10, padding: 16,
            display: "flex", flexDirection: "column", gap: 6
          }}>
            <p style={{ fontSize: 11, color: "#C9A84C", fontWeight: 600, marginBottom: 4 }}>
              Password for all: password123
            </p>
            {testAccounts.map(acc => (
              <button
                key={acc.email}
                onClick={() => { setEmail(acc.email); setPassword("password123") }}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "6px 8px", borderRadius: 6, border: "none",
                  background: "transparent", cursor: "pointer",
                  transition: "background 0.1s"
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                  {acc.email}
                </span>
                <span style={{ fontSize: 10, color: "rgba(201,168,76,0.7)" }}>{acc.role}</span>
              </button>
            ))}
          </div>

        </div>
      </div>

    </div>
  )
}