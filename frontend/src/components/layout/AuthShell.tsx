import React from "react"

export const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 500, color: "#0B1D3A", marginBottom: 6
}

export const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", fontSize: 14, borderRadius: 10,
  border: "1.5px solid #E4E2DC", background: "white", color: "#1A1916",
  outline: "none", fontFamily: "'Inter', sans-serif"
}

export const primaryButton = (disabled: boolean): React.CSSProperties => ({
  width: "100%", padding: 13, borderRadius: 10, border: "none",
  background: disabled ? "#8A9BC0" : "#0B1D3A", color: "white",
  fontSize: 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "'Inter', sans-serif"
})

export const errorBox: React.CSSProperties = {
  padding: "10px 14px", borderRadius: 8, marginBottom: 20,
  background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13
}

export const successBox: React.CSSProperties = {
  padding: "10px 14px", borderRadius: 8, marginBottom: 20,
  background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13
}

export const linkStyle: React.CSSProperties = { color: "#0B1D3A", fontWeight: 500, textDecoration: "underline" }

const css = `
.auth-root { min-height: 100vh; display: flex; font-family: 'Inter', sans-serif; background: #F8F7F4; }
.auth-brand { width: 45%; min-height: 100vh; background: #0B1D3A; display: flex; flex-direction: column; padding: 40px 48px; position: relative; overflow: hidden; }
.auth-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 24px; }
.auth-headline { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 700; color: white; line-height: 1.2; margin: 0; }
.auth-copy { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.7; max-width: 360px; margin: 0; }
.auth-form { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 48px; }
.auth-title { font-family: 'Playfair Display', serif; font-size: 30px; font-weight: 700; color: #0B1D3A; margin: 0 0 8px; }

@media (max-width: 800px) {
  .auth-root { flex-direction: column; }
  .auth-brand { width: 100%; min-height: 0; padding: 22px 20px 24px; }
  .auth-hero { flex: none; margin-top: 18px; gap: 8px; }
  .auth-headline { font-size: 24px; }
  .auth-copy { display: none; }
  .auth-brand-footer { display: none; }
  .auth-form { padding: 28px 20px 40px; align-items: flex-start; }
  .auth-title { font-size: 26px; }
}
`

export default function AuthShell({
  title, subtitle, children
}: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="auth-root">
      <style>{css}</style>

      <div className="auth-brand">
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#C9A84C" }} />
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: "#C9A84C", color: "#0B1D3A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, flexShrink: 0
          }}>U</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: "white" }}>UniArena</div>
            <div style={{ fontSize: 9, color: "#C9A84C", letterSpacing: "0.14em", marginTop: 1 }}>UNI EXPERIENCE REDEFINED</div>
          </div>
        </div>

        <div className="auth-hero">
          <h1 className="auth-headline">
            Every club. Every game.<br /><span style={{ color: "#C9A84C" }}>Every event.</span>
          </h1>
          <p className="auth-copy">
            Join clubs and societies, follow your teams, and never miss an event, all in one place at Mount Kenya University.
          </p>
        </div>

        <p className="auth-brand-footer" style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          © 2026 Nyangabi Derrick. UniArena. All rights reserved.
        </p>
      </div>

      <div className="auth-form">
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2 className="auth-title">{title}</h2>
          <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 28 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}