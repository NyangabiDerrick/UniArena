"use client"

import { useState, useEffect, use } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { useSession } from "next-auth/react"
import { Users, Calendar, FileText, ArrowLeft, CheckCircle, MapPin, MessagesSquare } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { imageSrc } from "@/lib/groupImagesApi"
import { errorMessage } from "@/lib/types"
import type { Club, Committee, Event, Membership } from "@/lib/types"

const tabs = ["About", "Events", "News", "Members", "Committee", "Discussions"]

const emptyState = (icon: React.ReactNode, text: string) => (
  <div style={{ textAlign: "center", padding: "40px 0" }}>
    <div style={{ marginBottom: 12 }}>{icon}</div>
    <p style={{ fontSize: 14, color: "#6B6962" }}>{text}</p>
  </div>
)

export default function ClubProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("About")
  const [membership, setMembership] = useState<string | null | undefined>(undefined)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState("")

  useEffect(() => {
    api.getClub(id)
      .then(res => setClub(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "STUDENT") return
    api.getMembershipStatus(id)
      .then(res => setMembership(res.data.status))
      .catch(() => setMembership(null))
  }, [id, status, session?.user?.role])

  const join = async () => {
    setJoining(true)
    setJoinError("")
    try {
      await api.joinClub(id)
      setMembership("PENDING")
    } catch (err) {
      setJoinError(errorMessage(err))
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p></MainLayout>
  }

  if (!club) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 12 }}>Not found</p>
          <Link href="/clubs" style={{ fontSize: 13, color: "#0B1D3A", textDecoration: "underline" }}>Back to Clubs</Link>
        </div>
      </MainLayout>
    )
  }

  const banner = imageSrc(club.bannerUrl)
  const logo = imageSrc(club.logoUrl)
  const isMember = membership === "ACTIVE"

  const joinButton = () => {
    if (session?.user?.role !== "STUDENT" || membership === undefined) return null
    const base: React.CSSProperties = {
      display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
      border: "none", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif"
    }
    if (membership === "ACTIVE") return <span style={{ ...base, background: "#F0FDF4", color: "#15803D" }}><CheckCircle size={15} /> Member</span>
    if (membership === "PENDING") return <span style={{ ...base, background: "#FFFBEB", color: "#B45309" }}>Request pending</span>
    if (membership === "REJECTED") return <span style={{ ...base, background: "#FEF2F2", color: "#DC2626" }}>Request declined</span>
    if (membership === "BANNED") return null
    return (
      <button onClick={join} disabled={joining} style={{ ...base, background: joining ? "#8A9BC0" : "#0B1D3A", color: "white", cursor: joining ? "not-allowed" : "pointer" }}>
        {joining ? "Sending..." : `Join ${club.type === "SOCIETY" ? "Society" : "Club"}`}
      </button>
    )
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/clubs" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B6962", textDecoration: "none", marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to Clubs
        </Link>

        <div style={{
          borderRadius: "16px 16px 0 0", height: 170,
          background: banner ? `url(${banner}) center / cover` : "linear-gradient(135deg, #2563EB, #1D4ED8)"
        }} />

        <div style={{ background: "white", borderRadius: "0 0 16px 16px", padding: "0 28px 24px", border: "1px solid #E4E2DC", borderTop: "none", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, background: "#EFF6FF", color: "#1D4ED8", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 28, border: "4px solid white", marginTop: -36, flexShrink: 0, boxShadow: "0 4px 12px rgba(11,29,58,0.12)" }}>
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={`${club.name} logo`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : club.name.charAt(0)}
              </div>
              <div style={{ paddingBottom: 4 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>{club.name}</h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#9CA3AF", alignItems: "center" }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: club.type === "SOCIETY" ? "#F5F3FF" : "#EFF6FF", color: club.type === "SOCIETY" ? "#6D28D9" : "#1D4ED8", fontWeight: 500 }}>
                    {club.type === "SOCIETY" ? "Society" : "Club"}
                  </span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#F1F5F9", color: "#475569", fontWeight: 500 }}>{club.category}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={13} />{club._count?.memberships ?? 0} members</span>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {joinButton()}
              {joinError && <p style={{ fontSize: 12, color: "#DC2626", marginTop: 8 }}>{joinError}</p>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, background: "#F3F4F6", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 20 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
              background: activeTab === tab ? "white" : "transparent",
              color: activeTab === tab ? "#0B1D3A" : "#6B6962",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              fontFamily: "'Inter', sans-serif"
            }}>{tab}</button>
          ))}
        </div>

        <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", border: "1px solid #E4E2DC" }}>

          {activeTab === "About" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 16 }}>About {club.name}</h2>
              {(club.description || "No description yet.").split("\n\n").map((p: string, i: number) => (
                <p key={i} style={{ fontSize: 14, color: "#374151", lineHeight: 1.8, marginBottom: 16 }}>{p}</p>
              ))}
            </div>
          )}

          {activeTab === "Events" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 20 }}>Upcoming events</h2>
              {(club.events?.length ?? 0) > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {(club.events ?? []).map((ev: Event) => (
                    <Link key={ev.id} href={`/events/${ev.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 12, border: "1px solid #E4E2DC" }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, flexShrink: 0, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Calendar size={18} color="#1D4ED8" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "#0B1D3A", marginBottom: 4 }}>{ev.title}</p>
                          <p style={{ fontSize: 12, color: "#9CA3AF", display: "flex", gap: 12 }}>
                            <span>{new Date(ev.startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={11} />{ev.venue}</span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : emptyState(<Calendar size={32} color="#E4E2DC" style={{ margin: "0 auto" }} />, "No upcoming events")}
            </div>
          )}

          {activeTab === "News" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 20 }}>Recent news</h2>
              {emptyState(<FileText size={32} color="#E4E2DC" style={{ margin: "0 auto" }} />, "No articles yet")}
            </div>
          )}

          {activeTab === "Members" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 16 }}>Members</h2>
              {(club.memberships?.length ?? 0) > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(club.memberships ?? []).map((m: Membership) => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, border: "1px solid #F3F4F6" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: "#EFF6FF", color: "#1D4ED8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                        {m.user?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{m.user?.name}</p>
                        <p style={{ fontSize: 11, color: "#9CA3AF" }}>{m.user?.faculty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ fontSize: 14, color: "#6B6962" }}>No members yet.</p>}
            </div>
          )}

          {activeTab === "Committee" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 20 }}>Committee</h2>
              {(club.committees?.length ?? 0) > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(club.committees ?? []).map((c: Committee) => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 12, border: "1px solid #E4E2DC" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: "#0B1D3A", color: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>
                        {c.user?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{c.user?.name}</p>
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>{c.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ fontSize: 14, color: "#6B6962" }}>No committee assigned yet.</p>}
            </div>
          )}

          {activeTab === "Discussions" && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 12 }}>Discussions</h2>
              {isMember ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
                  <p style={{ fontSize: 14, color: "#6B6962", lineHeight: 1.6 }}>Talk with other members of {club.name}, read pinned updates, and ask questions.</p>
                  <Link href={`/clubs/${id}/discuss`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    <MessagesSquare size={15} /> Open discussions
                  </Link>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: "#6B6962" }}>Discussions are for members only. Join the {club.type === "SOCIETY" ? "society" : "club"} to take part.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  )
}