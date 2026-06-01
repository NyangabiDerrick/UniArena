"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, Calendar, FileText, CheckCircle, XCircle, Plus, Settings } from "lucide-react"

const pendingRequests = [
  { id:"1", name:"Alice Johnson", studentId:"UA-2024-010", faculty:"Law", requestedAt:"May 30, 2026" },
  { id:"2", name:"Bob Williams", studentId:"UA-2024-011", faculty:"Medicine", requestedAt:"May 29, 2026" },
  { id:"3", name:"Carol Smith", studentId:"UA-2024-012", faculty:"Engineering", requestedAt:"May 28, 2026" },
]

const members = [
  { id:"1", name:"Jane Leader", role:"President", joinedAt:"Jan 2026" },
  { id:"2", name:"Tom Brown", role:"Member", joinedAt:"Jan 2026" },
  { id:"3", name:"Lisa Chen", role:"Treasurer", joinedAt:"Feb 2026" },
  { id:"4", name:"Mark Davis", role:"Member", joinedAt:"Feb 2026" },
  { id:"5", name:"Sarah White", role:"Secretary", joinedAt:"Mar 2026" },
]

export default function ManageClubPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState(pendingRequests)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role
      if (role !== "CLUB_LEADER" && role !== "ADMIN") router.push("/dashboard")
    }
  }, [status, session, router])

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>
              Photography Society
            </h1>
            <p style={{ fontSize: 14, color: "#6B6962" }}>Club management dashboard</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/clubs/manage/create-event" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 10,
              background: "#0B1D3A", color: "white",
              fontSize: 13, fontWeight: 600, textDecoration: "none"
            }}>
              <Plus size={15} /> Create Event
            </Link>
            <Link href="/clubs/manage/edit" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px", borderRadius: 10,
              background: "white", color: "#0B1D3A",
              border: "1.5px solid #E4E2DC",
              fontSize: 13, fontWeight: 600, textDecoration: "none"
            }}>
              <Settings size={15} /> Edit Club
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Members", value: "124", icon: Users, bg: "#EFF6FF", color: "#1D4ED8" },
            { label: "Upcoming Events", value: "3", icon: Calendar, bg: "#FFF7ED", color: "#C2410C" },
            { label: "Pending Requests", value: String(requests.length), icon: Users, bg: "#FEF2F2", color: "#DC2626" },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} style={{
                background: "white", borderRadius: 14, padding: "22px",
                border: "1px solid #E4E2DC",
                display: "flex", alignItems: "center", gap: 16
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: s.bg, display: "flex", alignItems: "center", justifyContent: "center"
                }}>
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

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#F3F4F6", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 24 }}>
          {["overview", "members", "requests"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer", textTransform: "capitalize",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "#0B1D3A" : "#6B6962",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              fontFamily: "'Inter', sans-serif", position: "relative"
            }}>
              {tab}
              {tab === "requests" && requests.length > 0 && (
                <span style={{
                  marginLeft: 6, background: "#DC2626", color: "white",
                  fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 99
                }}>{requests.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "white", borderRadius: 14, padding: "22px", border: "1px solid #E4E2DC" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 16 }}>Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Link href="/clubs/manage/create-event" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                  borderRadius: 8, textDecoration: "none", transition: "background 0.15s"
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <Calendar size={16} color="#1D4ED8" />
                  <span style={{ fontSize: 13, color: "#374151" }}>Create new event</span>
                </Link>
                <Link href="/clubs/manage/post-news" style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                  borderRadius: 8, textDecoration: "none"
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <FileText size={16} color="#6D28D9" />
                  <span style={{ fontSize: 13, color: "#374151" }}>Post news article</span>
                </Link>
                <button onClick={() => setActiveTab("requests")} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "11px 12px",
                  borderRadius: 8, background: "transparent", border: "none", cursor: "pointer",
                  width: "100%", textAlign: "left"
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  <Users size={16} color="#C2410C" />
                  <span style={{ fontSize: 13, color: "#374151" }}>Review {requests.length} membership requests</span>
                </button>
              </div>
            </div>

            <div style={{ background: "white", borderRadius: 14, padding: "22px", border: "1px solid #E4E2DC" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 16 }}>Recent Members</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {members.slice(0, 4).map(m => (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: "#EFF6FF", color: "#1D4ED8",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 13
                    }}>{m.name.charAt(0)}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{m.name}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF" }}>{m.role} — {m.joinedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Members */}
        {activeTab === "members" && (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E4E2DC" }}>
                  {["Name", "Role", "Joined", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B6962" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: i < members.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: "#EFF6FF", color: "#1D4ED8",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 12
                        }}>{m.name.charAt(0)}</div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{m.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B6962" }}>{m.role}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#6B6962" }}>{m.joinedAt}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button style={{ fontSize: 12, color: "#DC2626", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Requests */}
        {activeTab === "requests" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.length === 0 ? (
              <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: "48px", textAlign: "center" }}>
                <CheckCircle size={32} color="#16A34A" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: "#6B6962" }}>All membership requests have been reviewed</p>
              </div>
            ) : requests.map(r => (
              <div key={r.id} style={{
                background: "white", borderRadius: 14, padding: "18px 22px",
                border: "1px solid #E4E2DC",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "#EFF6FF", color: "#1D4ED8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 15
                  }}>{r.name.charAt(0)}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>{r.studentId} — {r.faculty} — {r.requestedAt}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setRequests(prev => prev.filter(x => x.id !== r.id))} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "#16A34A", color: "white", fontSize: 12, fontWeight: 600,
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    <CheckCircle size={13} /> Approve
                  </button>
                  <button onClick={() => setRequests(prev => prev.filter(x => x.id !== r.id))} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "#DC2626", color: "white", fontSize: 12, fontWeight: 600,
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    <XCircle size={13} /> Reject
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