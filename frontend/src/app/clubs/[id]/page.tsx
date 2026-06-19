"use client"

import { useState, useEffect, use } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { useSession } from "next-auth/react"
import { Users, Calendar, FileText, ArrowLeft, CheckCircle, MapPin } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

const tabs = ["About", "Events", "News", "Members", "Committee"]

export default function ClubProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [club, setClub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("About")
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    api.getClub(id)
      .then(res => setClub(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 14, color: "#9CA3AF" }}>Loading club...</p>
        </div>
      </MainLayout>
    )
  }

  if (!club) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🏛️</p>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Club not found</p>
          <Link href="/clubs" style={{ fontSize: 13, color: "#0B1D3A", textDecoration: "underline", marginTop: 12, display: "inline-block" }}>
            Back to Clubs
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Back */}
        <Link href="/clubs" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#6B6962", textDecoration: "none", marginBottom: 20
        }}>
          <ArrowLeft size={15} /> Back to Clubs
        </Link>

        {/* Banner */}
        <div style={{
          background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
          borderRadius: 16, height: 180, marginBottom: 0,
          position: "relative"
        }} />

        {/* Club Header Card */}
        <div style={{
          background: "white", borderRadius: "0 0 16px 16px",
          padding: "0 28px 24px",
          border: "1px solid #E4E2DC",
          borderTop: "none",
          marginBottom: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
              {/* Logo */}
              <div style={{
                width: 72, height: 72, borderRadius: 16,
                background: "#EFF6FF", color: "#1D4ED8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Playfair Display', serif", fontWeight: 700,
                fontSize: 28, border: "4px solid white",
                marginTop: -36, flexShrink: 0,
                boxShadow: "0 4px 12px rgba(11,29,58,0.12)"
              }}>
                {club.name.charAt(0)}
              </div>

              <div style={{ paddingBottom: 4 }}>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 24, fontWeight: 700, color: "#0B1D3A", marginBottom: 6
                }}>{club.name}</h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#9CA3AF" }}>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 99,
                    background: "#F1F5F9", color: "#475569", fontWeight: 500
                  }}>{club.category}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={13} />
                    {club.memberCount || club._count?.memberships || 0} members
                  </div>
                  {club.foundedAt && (
                    <span>Founded {new Date(club.foundedAt).getFullYear()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Join Button */}
            {session?.user?.role === "STUDENT" && (
              <button
                onClick={() => {
                  api.joinClub(club.id).catch(() => {})
                  setJoined(true)
                }}
                disabled={joined}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  cursor: joined ? "not-allowed" : "pointer",
                  background: joined ? "#F0FDF4" : "#0B1D3A",
                  color: joined ? "#15803D" : "white",
                  fontSize: 13, fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.2s"
                }}
              >
                {joined ? <><CheckCircle size={15} /> Request Sent</> : "Join Club"}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, background: "#F3F4F6",
          padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 20
        }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "#0B1D3A" : "#6B6962",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              fontFamily: "'Inter', sans-serif"
            }}>{tab}</button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          background: "white", borderRadius: 16, padding: "28px 32px",
          border: "1px solid #E4E2DC"
        }}>

          {/* About */}
          {activeTab === "About" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18, color: "#0B1D3A", marginBottom: 16
              }}>About {club.name}</h2>
              {club.description ? (
                club.description.split("\n\n").map((para: string, i: number) => (
                  <p key={i} style={{
                    fontSize: 14, color: "#374151", lineHeight: 1.8,
                    marginBottom: 16
                  }}>{para}</p>
                ))
              ) : (
                <p style={{ fontSize: 14, color: "#6B6962" }}>No description available.</p>
              )}
            </div>
          )}

          {/* Events */}
          {activeTab === "Events" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18, color: "#0B1D3A", marginBottom: 20
              }}>Upcoming Events</h2>
              {club.events?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {club.events.map((event: any) => (
                    <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 16,
                        padding: "16px 20px", borderRadius: 12,
                        border: "1px solid #E4E2DC",
                        transition: "background 0.15s"
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F9FAFB"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "white"}
                      >
                        <div style={{
                          width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                          background: "#EFF6FF",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          <Calendar size={18} color="#1D4ED8" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "#0B1D3A", marginBottom: 4 }}>
                            {event.title}
                          </p>
                          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9CA3AF" }}>
                            <span>{new Date(event.startsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <MapPin size={11} /> {event.venue}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Calendar size={32} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 14, color: "#6B6962" }}>No upcoming events</p>
                </div>
              )}
            </div>
          )}

          {/* News */}
          {activeTab === "News" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18, color: "#0B1D3A", marginBottom: 20
              }}>Recent News</h2>
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <FileText size={32} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: "#6B6962" }}>No articles yet</p>
              </div>
            </div>
          )}

          {/* Members */}
          {activeTab === "Members" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18, color: "#0B1D3A", marginBottom: 16
              }}>Members</h2>
              {club.memberships?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {club.memberships.map((m: any) => (
                    <div key={m.id || m.user?.email} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px", borderRadius: 10,
                      border: "1px solid #F3F4F6"
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: "#EFF6FF", color: "#1D4ED8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 13
                      }}>{m.user?.name?.charAt(0) || "?"}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{m.user?.name}</p>
                        <p style={{ fontSize: 11, color: "#9CA3AF" }}>{m.user?.faculty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#6B6962" }}>
                  This club has {club.memberCount || 0} members. Member list is visible to members only.
                </p>
              )}
            </div>
          )}

          {/* Committee */}
          {activeTab === "Committee" && (
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 18, color: "#0B1D3A", marginBottom: 20
              }}>Committee</h2>
              {club.committees?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {club.committees.map((c: any) => (
                    <div key={c.id} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 18px", borderRadius: 12,
                      border: "1px solid #E4E2DC"
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: "#0B1D3A", color: "#C9A84C",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 15
                      }}>{c.user?.name?.charAt(0) || "?"}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{c.user?.name}</p>
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#6B6962" }}>No committee members assigned yet.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  )
}