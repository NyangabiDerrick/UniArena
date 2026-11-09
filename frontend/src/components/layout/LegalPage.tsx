"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

// Back uses browser history, so it returns to the form you came from.
// If there is no history (the page was opened directly), it goes to sign-in.
export function LegalPage({ title, version, children }: { title: string; version: string; children: React.ReactNode }) {
  const router = useRouter()

  const back = () => {
    if (window.history.length > 1) router.back()
    else router.push("/auth/login")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F7F4", fontFamily: "'Inter', sans-serif", padding: "48px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", background: "white", borderRadius: 16, border: "1px solid #E4E2DC", padding: "40px 44px" }}>
        <button
          onClick={back}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "#6B6962", fontFamily: "'Inter', sans-serif" }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: "#0B1D3A", margin: "16px 0 6px" }}>{title}</h1>
        <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 28 }}>Version {version}</p>
        <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.75 }}>{children}</div>
      </div>
    </div>
  )
}

export function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0B1D3A", marginBottom: 6 }}>{n}. {title}</h2>
      <div>{children}</div>
    </section>
  )
}