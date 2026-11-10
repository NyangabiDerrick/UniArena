"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"

// Routes that stay open even when the user hasn't accepted yet
const OPEN_PREFIXES = ["/auth", "/legal"]

export default function PolicyGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const pathname = usePathname()
  const [needsAccept, setNeedsAccept] = useState(false)
  const [checked, setChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const open = OPEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"))

  useEffect(() => {
    if (status !== "authenticated" || open) return
    let cancelled = false
    api.getPolicyStatus()
      .then(res => { if (!cancelled) setNeedsAccept(!res.data.accepted) })
      .catch(() => { if (!cancelled) setNeedsAccept(false) })
    return () => { cancelled = true }
  }, [status, open])

  const accept = async () => {
    setBusy(true)
    setError("")
    try {
      await api.acceptPolicy()
      setNeedsAccept(false)
    } catch {
      setError("Could not record your acceptance. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (status !== "authenticated" || open || !needsAccept) return <>{children}</>

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F4", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 520, background: "white", borderRadius: 16, border: "1px solid #E4E2DC", padding: 36 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#0B1D3A", marginBottom: 10 }}>Please review our updated terms</h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 20 }}>
          Before you continue, please read the{" "}
          <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#0B1D3A", fontWeight: 600 }}>Terms of Use</Link> and the{" "}
          <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#0B1D3A", fontWeight: 600 }}>Data Policy</Link>.
        </p>
        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#374151", marginBottom: 20, cursor: "pointer" }}>
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ marginTop: 3 }} />
          I have read and accept the Terms of Use and the Data Policy.
        </label>
        {error && <p style={{ fontSize: 13, color: "#991B1B", marginBottom: 12 }}>{error}</p>}
        <button
          onClick={accept}
          disabled={!checked || busy}
          style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: checked && !busy ? "#0B1D3A" : "#8A9BC0", color: "white", fontSize: 14, fontWeight: 600, cursor: checked && !busy ? "pointer" : "not-allowed", fontFamily: "'Inter', sans-serif" }}
        >
          {busy ? "Saving..." : "Accept and continue"}
        </button>
      </div>
    </div>
  )
}