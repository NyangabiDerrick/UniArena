"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { Users, Calendar, CheckCircle, XCircle } from "lucide-react"
import { api } from "@/lib/api"

const card: React.CSSProperties = {
  background: "white", borderRadius: 14, border: "1px solid #E4E2DC"
}

const date = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

export default function ManageClubPage() {
  const { status } = useSession()
  const [club, setClub] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [tab, setTab] = useState("overview")

  const load = useCallback(async () => {
    try {
      const mine = await api.getMyClub()
      setClub(mine.data)
      const list = await api.getClubMembers(mine.data.id)
      setMembers(list.data)
      setError("")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    load()
  }, [status, load])

  const decide = async (userId: string, next: "ACTIVE" | "REJECTED", successText: string) => {
    setNotice("")
    try {
      await api.updateMembership(club.id, userId, next)
      setNotice(successText)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const removeMember = (m: any) => {
    if (!window.confirm(`Remove ${m.user.name} from ${club.name}?`)) return
    decide(m.user.id, "REJECTED", `${m.user.name} was removed`)
  }

  const active = members.filter(m => m.status === "ACTIVE")
  const pending = members.filter(m => m.status === "PENDING")

  const tabBtn = (key: string): React.CSSProperties => ({
    padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
    background: tab === key ? "white" : "transparent",
    color: tab === key ? "#0B1D3A" : "#6B6962",
    boxShadow: tab === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none"
  })

  if (loading) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p></MainLayout>
  }

  if (!club) {
    return (
      <MainLayout>
        <div style={{ ...card, maxWidth: 520, margin: "60px auto", padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🏛️</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A", marginBottom: 8 }}>
            No club to manage
          </h2>
          <p style={{ fontSize: 14, color: "#6B6962", lineHeight: 1.6 }}>
            {error || "You have not been assigned a club or society yet."} An administrator assigns leaders.
            If you were just assigned, sign out and sign in again.
          </p>
        </div>
      </MainLayout>
    )
  }

  const stats = [
    { label: "Members", value: active.length, icon: Users, bg: "#EFF6FF", color: "#1D4ED8" },
    { label: "Upcoming events", value: club.upcomingEvents, icon: Calendar, bg: "#FFF7ED", color: "#C2410C" },
    { label: "Pending requests", value: pending.length, icon: Users, bg: "#FEF2F2", color: "#DC2626" }
  ]

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>
            {club.name}
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>
            {club.type === "SOCIETY" ? "Society" : "Club"} management
          </p>
        </div>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {stats.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} style={{ ...card, padding: 22, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color={s.color} />
                </div>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: "#6B6962", marginTop: 4 }}>{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", gap: 4, background: "#F3F4F6", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 24 }}>
          <button style={tabBtn("overview")} onClick={() => setTab("overview")}>Overview</button>
          <button style={tabBtn("members")} onClick={() => setTab("members")}>Members</button>
          <button style={tabBtn("requests")} onClick={() => setTab("requests")}>
            Requests
            {pending.length > 0 && (
              <span style={{ marginLeft: 6, background: "#DC2626", color: "white", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>
                {pending.length}
              </span>
            )}
          </button>
        </div>

        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ ...card, padding: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 14 }}>About</h2>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{club.description || "No description yet."}</p>
              {pending.length > 0 && (
                <button onClick={() => setTab("requests")} style={{ marginTop: 18, padding: "10px 16px", borderRadius: 8, border: "none", background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                  Review {pending.length} request{pending.length !== 1 ? "s" : ""}
                </button>
              )}
            </div>
            <div style={{ ...card, padding: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 14 }}>Newest members</h2>
              {active.length === 0 ? (
                <p style={{ fontSize: 13, color: "#6B6962" }}>No members yet.</p>
              ) : active.slice(0, 5).map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                    {m.user.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{m.user.name}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>Joined {date(m.joinedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "members" && (
          <div style={{ ...card, overflow: "hidden" }}>
            {active.length === 0 ? (
              <p style={{ padding: 40, textAlign: "center", fontSize: 14, color: "#6B6962" }}>No members yet.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E4E2DC" }}>
                    {["Name", "Registration no.", "Faculty", "Joined", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B6962" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: i < active.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                      <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{m.user.name}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B6962" }}>{m.user.studentId}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B6962" }}>{m.user.faculty || "—"}</td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B6962" }}>{date(m.joinedAt)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => removeMember(m)} style={{ fontSize: 12, color: "#DC2626", background: "none", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "requests" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.length === 0 ? (
              <div style={{ ...card, padding: 48, textAlign: "center" }}>
                <CheckCircle size={32} color="#16A34A" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: "#6B6962" }}>No pending requests</p>
              </div>
            ) : pending.map(m => (
              <div key={m.id} style={{ ...card, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>
                    {m.user.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{m.user.name}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>
                      {m.user.studentId}{m.user.faculty ? ` · ${m.user.faculty}` : ""} · Requested {date(m.joinedAt)}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => decide(m.user.id, "ACTIVE", `${m.user.name} is now a member`)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "#16A34A", color: "white", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button onClick={() => decide(m.user.id, "REJECTED", `Request from ${m.user.name} was declined`)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "#DC2626", color: "white", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                    <XCircle size={13} /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}