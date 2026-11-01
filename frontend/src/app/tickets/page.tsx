"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react"
import { getMyTickets } from "@/lib/ticketsApi"
import type { Ticket } from "@/lib/ticketTypes"

const when = (d: string) =>
  new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })

export default function MyTicketsPage() {
  const { status } = useSession()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (status !== "authenticated") return
    getMyTickets()
      .then(setTickets)
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load tickets"))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <MainLayout>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>My Tickets</h1>
        <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 28 }}>Show your ticket code at the door.</p>

        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        {loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : tickets.length === 0 ? (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 48, textAlign: "center" }}>
            <TicketIcon size={36} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 16 }}>You don&apos;t have any tickets yet.</p>
            <Link href="/events" style={{ display: "inline-block", padding: "10px 20px", borderRadius: 8, background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Browse events</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {tickets.map(t => (
              <div key={t.id} style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                <div>
                  <Link href={`/events/${t.event.id}`} style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", textDecoration: "none" }}>{t.event.title}</Link>
                  <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={12} />{when(t.event.startsAt)}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{t.event.venue}</span>
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>Ticket code</p>
                  <p style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#0B1D3A", background: "#F8F7F4", padding: "6px 12px", borderRadius: 8 }}>{t.qrCode}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}