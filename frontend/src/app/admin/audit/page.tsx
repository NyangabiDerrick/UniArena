"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ScrollText } from "lucide-react"
import { api } from "@/lib/api"
import { errorMessage } from "@/lib/types"
import type { AuditLog } from "@/lib/types"

const card: React.CSSProperties = { background: "white", borderRadius: 14, border: "1px solid #E4E2DC", overflow: "hidden" }

const when = (d: string) =>
  new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

export default function AuditLogsPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const role = session?.user?.role
  const permitted = role === "ADMIN" || role === "MODERATOR"

  useEffect(() => {
    if (status !== "authenticated" || !permitted) return
    let cancelled = false
    api.getAuditLogs()
      .then(res => { if (!cancelled) setLogs(res.data) })
      .catch(err => { if (!cancelled) setError(errorMessage(err)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [status, permitted])

  if (status === "authenticated" && !permitted) {
    return <p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only administrators can view the audit log.</p>
  }

  const th: React.CSSProperties = { padding: "12px 18px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B6962", background: "#F9FAFB", borderBottom: "1px solid #E4E2DC", whiteSpace: "nowrap" }
  const td: React.CSSProperties = { padding: "14px 18px", fontSize: 13, color: "#374151", borderBottom: "1px solid #F3F4F6", verticalAlign: "top" }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Audit log</h1>
        <p style={{ fontSize: 14, color: "#6B6962" }}>A permanent record of admin and leader actions. Entries cannot be edited or deleted.</p>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

      <div style={card}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <ScrollText size={36} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "#6B6962" }}>No actions recorded yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr>
                  <th style={th}>Action</th>
                  <th style={th}>Details</th>
                  <th style={th}>By</th>
                  <th style={th}>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ ...td, fontWeight: 600, color: "#0B1D3A" }}>{l.action}</td>
                    <td style={td}>
                      <span style={{ color: "#0B1D3A" }}>{l.details || "—"}</span>
                      <span style={{ display: "block", fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{l.targetType}</span>
                    </td>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>{l.admin?.name ?? "Unknown"}</td>
                    <td style={{ ...td, whiteSpace: "nowrap", color: "#9CA3AF" }}>{when(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && logs.length > 0 && (
        <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>Showing the {logs.length} most recent actions.</p>
      )}
    </div>
  )
}