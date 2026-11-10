"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"

const footerLink: React.CSSProperties = { color: "#6B6962", textDecoration: "underline" }

// One set of phone rules for every signed-in page
const css = `
.app-main { margin-left: 240px; }
.app-pad { padding: 32px; }
.app-backdrop { display: none; }
.app-menu-btn { display: none; }

@media (max-width: 900px) {
  .app-main { margin-left: 0 !important; }
  .app-pad { padding: 16px !important; }
  .app-navbar { left: 0 !important; padding: 0 12px !important; }
  .app-menu-btn { display: flex !important; }
  .app-hide-mobile { display: none !important; }

  .app-sidebar { transform: translateX(-100%); transition: transform 0.2s ease; }
  .app-sidebar.open { transform: translateX(0); box-shadow: 0 0 40px rgba(0,0,0,0.4); }
  .app-backdrop.open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 35; }

  [style*="grid-template-columns"] { grid-template-columns: minmax(0, 1fr) !important; }
  [style*="position: sticky"] { position: static !important; }
  table { display: block; overflow-x: auto; max-width: 100%; }
  h1 { word-break: break-word; }
}
`

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
  }, [status, router])

  // Close the menu after moving to another page
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  if (status === "loading") {
    return (
      <div className="bg-[#F8F7F4]" style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center"
      }}>
        <p style={{ color: "#6B6962", fontSize: 14 }}>Loading UniArena...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="bg-[#F8F7F4]" style={{ minHeight: "100vh" }}>
      <style>{css}</style>
      <div className={`app-backdrop${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(false)} />
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <Navbar onMenu={() => setMenuOpen(o => !o)} />
      <main
        className="app-main bg-[#F8F7F4]"
        style={{ paddingTop: 60, minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <div className="app-pad" style={{ flex: 1, minWidth: 0 }}>{children}</div>
        <footer style={{
          padding: "18px 16px",
          borderTop: "1px solid #E4E2DC",
          fontSize: 12, color: "#9CA3AF", textAlign: "center"
        }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, marginBottom: 8, flexWrap: "wrap" }}>
            <Link href="/legal/terms" target="_blank" rel="noopener noreferrer" style={footerLink}>Terms of Use</Link>
            <Link href="/legal/privacy" target="_blank" rel="noopener noreferrer" style={footerLink}>Data Policy</Link>
          </div>
          © 2026 Nyangabi Derrick. UniArena. All rights reserved.
        </footer>
      </main>
    </div>
  )
}