"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import { getMyTickets } from "@/lib/ticketsApi"

interface EventData {
  id: string
  title: string
  description: string | null
  venue: string
  startsAt: string
  endsAt: string
  capacity: number
  isFree: boolean
  status: string
  moderationNote: string | null
  club: { name: string } | null
  team: { name: string } | null
  creator: { name: string } | null
  _count: { tickets: number }
}

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 28, border: "1px solid #E4E2DC" }

const dateOf = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
const timeOf = (d: string) =>
  new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { status } = useSession()
  const [event, setEvent] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    api.getEvent(id)
      .then(res => setEvent(res.data as unknown as EventData))
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [id, reloadKey])

  // Is this person already going? Check their own tickets.
  useEffect(() => {
    if (status !== "authenticated") return
    getMyTickets()
      .then(list => {
        const mine = list.find(t => t.event.id === id)
        if (mine) setCode(mine.qrCode)
      })
      .catch(() => {})
  }, [id, status])

  const rsvp = async () => {
    setWorking(true)
    setError("")
    try {
      const res = await api.purchaseTicket(id)
      setMessage(res.message)
      setCode((res.data as unknown as { qrCode: string }).qrCode)
      setReloadKey(k => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setWorking(false)
    }
  }

  if (loading) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p></MainLayout>
  }

  if (!event) {
    return (
      <MainLayout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 12 }}>Event not found</p>
          <Link href="/events" style={{ fontSize: 13, color: "#0B1D3A", textDecoration: "underline" }}>Back to Events</Link>
        </div>
      </MainLayout>
    )
  }

  const spotsLeft = Math.max(0, event.capacity - event._count.tickets)
  const cancelled = event.status === "CANCELLED"
  const ended = new Date(event.endsAt) < new Date()
  const organiser = event.club?.name || event.team?.name || event.creator?.name || "UniArena"

  const action = () => {
    if (code) {
      return (
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: cancelled ? "#DC2626" : "#15803D", fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
            <CheckCircle size={18} /> {cancelled ? "Your ticket is void: event cancelled" : "You're going"}
          </div>
          <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>Ticket code</p>
          <p style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#0B1D3A", background: "#F8F7F4", padding: "8px 12px", borderRadius: 8, marginBottom: 14, textDecoration: cancelled ? "line-through" : "none" }}>{code}</p>
          <Link href="/tickets" style={{ fontSize: 13, color: "#0B1D3A", textDecoration: "underline" }}>View all my tickets</Link>
        </div>
      )
    }
    const blocked = cancelled ? "This event was cancelled" : ended ? "This event has ended" : !event.isFree ? "Payments coming soon" : spotsLeft === 0 ? "Sold out" : ""
    return (
      <>
        <button onClick={rsvp} disabled={working || !!blocked}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif",
            background: blocked ? "#E5E7EB" : working ? "#8A9BC0" : "#0B1D3A", color: blocked ? "#6B7280" : "white",
            cursor: blocked || working ? "not-allowed" : "pointer" }}>
          {blocked || (working ? "Confirming..." : "Confirm RSVP")}
        </button>
        {!event.isFree && !ended && !cancelled && (
          <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 12 }}>
            Online payments will be available soon.
          </p>
        )}
      </>
    )
  }

  const details = [
    { Icon: Calendar, label: "Date", value: dateOf(event.startsAt), bg: "#EFF6FF", color: "#1D4ED8" },
    { Icon: Clock, label: "Time", value: `${timeOf(event.startsAt)} – ${timeOf(event.endsAt)}`, bg: "#F5F3FF", color: "#6D28D9" },
    { Icon: MapPin, label: "Venue", value: event.venue, bg: "#F0FDF4", color: "#15803D" },
    { Icon: Users, label: "Spots", value: cancelled ? "Cancelled" : `${spotsLeft} left of ${event.capacity}`, bg: "#FFF7ED", color: "#C2410C" }
  ]

  return (
    <MainLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Link href="/events" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B6962", textDecoration: "none", marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to Events
        </Link>

        {cancelled && (
          <div style={{ padding: "14px 18px", borderRadius: 12, marginBottom: 20, background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", fontSize: 14, lineHeight: 1.6 }}>
            <strong>This event was cancelled.</strong>
            {event.moderationNote && <> Reason: {event.moderationNote}</>}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={card}>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {event.isFree && <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "#F0FDF4", color: "#15803D", fontWeight: 500 }}>Free</span>}
                {cancelled && <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "#FEF2F2", color: "#DC2626", fontWeight: 500 }}>Cancelled</span>}
                {!cancelled && ended && <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 99, background: "#F3F4F6", color: "#6B7280", fontWeight: 500 }}>Ended</span>}
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>{event.title}</h1>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>Organised by {organiser}</p>
            </div>

            <div style={card}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 20 }}>Event details</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {details.map(({ Icon, label, value, bg, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={18} color={color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 14, color: "#0B1D3A", fontWeight: 500 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {event.description && (
              <div style={card}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 16 }}>About this event</h2>
                {event.description.split("\n\n").map((p, i) => (
                  <p key={i} style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginBottom: 14 }}>{p}</p>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...card, position: "sticky", top: 80 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 20 }}>
              {event.isFree ? "Reserve your spot" : "Tickets"}
            </h2>
            {message && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{message}</div>}
            {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}
            {action()}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}