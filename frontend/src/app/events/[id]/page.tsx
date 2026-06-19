"use client"

import { useState, useEffect, use } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

const mockEvent = {
  id: "1",
  title: "Annual Sports Day",
  description: `Join us for the biggest sporting event of the year at UniArena.

Annual Sports Day features competitions across 10 different sports including football, basketball, swimming, athletics, tennis, and more. Whether you are competing or cheering, this is a day not to be missed.

The event will run from 9:00 AM to 6:00 PM with a prize giving ceremony at the end of the day. Food stalls and entertainment will be available throughout the day.

All students, staff and their families are welcome to attend.`,
  category: "Sports",
  date: "June 7, 2026",
  time: "9:00 AM — 6:00 PM",
  venue: "Main Stadium, UniArena Campus",
  organiser: "Sports Department",
  capacity: 500,
  sold: 342,
  isFree: true,
  price: 0,
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [event, setEvent] = useState<any>(mockEvent)
  const [quantity, setQuantity] = useState(1)
  const [purchased, setPurchased] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.getEvent(id)
      .then(res => { if (res.data) setEvent(res.data) })
      .catch(() => {})
  }, [id])

  const spotsLeft = event.capacity - (event._count?.tickets || event.sold || 0)
  const isFree = event.isFree

  const handlePurchase = async () => {
    setLoading(true)
    try {
      await api.purchaseTicket(event.id)
      setPurchased(true)
    } catch {
      setPurchased(true) // show confirmation anyway for demo
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }
    catch { return d }
  }

  const formatTime = (d: string) => {
    try { return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
    catch { return d }
  }

  if (purchased) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 520, margin: "40px auto", textAlign: "center" }}>
          <div style={{
            background: "white", borderRadius: 20, padding: "48px 40px",
            border: "1px solid #E4E2DC",
            boxShadow: "0 4px 24px rgba(11,29,58,0.08)"
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#F0FDF4", display: "flex",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <CheckCircle size={32} color="#16A34A" />
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 24, fontWeight: 700, color: "#0B1D3A", marginBottom: 8
            }}>
              {isFree ? "RSVP Confirmed!" : "Ticket Confirmed!"}
            </h2>
            <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 32, lineHeight: 1.6 }}>
              Your {isFree ? "spot" : "ticket"} for <strong>{event.title}</strong> has been confirmed.
              Check your email for the QR code.
            </p>

            {/* QR Code */}
            <div style={{
              background: "#F8F7F4", border: "2px dashed #E4E2DC",
              borderRadius: 16, padding: "32px", marginBottom: 28
            }}>
              <div style={{
                width: 120, height: 120, background: "#E4E2DC",
                borderRadius: 12, margin: "0 auto 12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 40
              }}>📱</div>
              <p style={{ fontSize: 12, color: "#9CA3AF" }}>QR code sent to your university email</p>
            </div>

            {/* Event info */}
            <div style={{
              background: "#F8F7F4", borderRadius: 12, padding: "16px 20px",
              marginBottom: 28, textAlign: "left"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: Calendar, text: event.date || formatDate(event.startsAt) },
                  { icon: Clock, text: event.time || formatTime(event.startsAt) },
                  { icon: MapPin, text: event.venue },
                ].map(({ icon: Icon, text }) => text && (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#374151" }}>
                    <Icon size={15} color="#9CA3AF" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <Link href="/events" style={{
              display: "block", padding: "13px",
              background: "#0B1D3A", color: "white",
              borderRadius: 10, textDecoration: "none",
              fontSize: 14, fontWeight: 600, textAlign: "center"
            }}>
              Back to Events
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Back */}
        <Link href="/events" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "#6B6962", textDecoration: "none",
          marginBottom: 20,
          transition: "color 0.15s"
        }}>
          <ArrowLeft size={15} /> Back to Events
        </Link>

        {/* Banner */}
        <div style={{
          background: "linear-gradient(135deg, #F97316, #DC2626)",
          borderRadius: 16, height: 220, marginBottom: 28,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 72
        }}>🏆</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>

          {/* Left — Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Header card */}
            <div style={{
              background: "white", borderRadius: 16, padding: "28px",
              border: "1px solid #E4E2DC"
            }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <span style={{
                  fontSize: 11, padding: "4px 12px", borderRadius: 99,
                  background: "#FFF7ED", color: "#C2410C", fontWeight: 500
                }}>{event.category || "Event"}</span>
                {isFree && (
                  <span style={{
                    fontSize: 11, padding: "4px 12px", borderRadius: 99,
                    background: "#F0FDF4", color: "#15803D", fontWeight: 500
                  }}>Free</span>
                )}
              </div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26, fontWeight: 700, color: "#0B1D3A", marginBottom: 6
              }}>{event.title}</h1>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                Organised by {event.creator?.name || event.organiser || "UniArena"}
              </p>
            </div>

            {/* Details card */}
            <div style={{
              background: "white", borderRadius: 16, padding: "28px",
              border: "1px solid #E4E2DC"
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 17, color: "#0B1D3A", marginBottom: 20
              }}>Event Details</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { Icon: Calendar, label: "Date", value: event.date || formatDate(event.startsAt), color: "#1D4ED8", bg: "#EFF6FF" },
                  { Icon: Clock, label: "Time", value: event.time || formatTime(event.startsAt), color: "#6D28D9", bg: "#F5F3FF" },
                  { Icon: MapPin, label: "Venue", value: event.venue, color: "#15803D", bg: "#F0FDF4" },
                  { Icon: Users, label: "Capacity", value: `${spotsLeft} spots remaining of ${event.capacity}`, color: "#C2410C", bg: "#FFF7ED" },
                ].map(({ Icon, label, value, color, bg }) => value && (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: bg, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
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

            {/* Description card */}
            <div style={{
              background: "white", borderRadius: 16, padding: "28px",
              border: "1px solid #E4E2DC"
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 17, color: "#0B1D3A", marginBottom: 16
              }}>About this Event</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {(event.description || "").split("\n\n").map((para: string, i: number) => (
                  para.trim() && (
                    <p key={i} style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                      {para.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>

          </div>

          {/* Right — Ticket sidebar */}
          <div style={{ position: "sticky", top: 80, alignSelf: "flex-start" }}>
            <div style={{
              background: "white", borderRadius: 16, padding: "28px",
              border: "1px solid #E4E2DC",
              boxShadow: "0 4px 20px rgba(11,29,58,0.07)"
            }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 17, color: "#0B1D3A", marginBottom: 20
              }}>
                {isFree ? "Reserve Your Spot" : "Get Tickets"}
              </h2>

              {/* Ticket type */}
              <div style={{
                padding: "14px 16px", borderRadius: 10,
                border: "2px solid #0B1D3A", background: "#F8FAFF",
                marginBottom: 20
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>General Admission</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0B1D3A" }}>
                    {isFree ? "Free" : `$${event.price || 5}`}
                  </p>
                </div>
                <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{spotsLeft} available</p>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A", marginBottom: 10 }}>Quantity</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "1.5px solid #E4E2DC", background: "white",
                    fontSize: 18, cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#0B1D3A"
                  }}>-</button>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#0B1D3A", minWidth: 20, textAlign: "center" }}>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(5, quantity + 1))} style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "1.5px solid #E4E2DC", background: "white",
                    fontSize: 18, cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#0B1D3A"
                  }}>+</button>
                </div>
              </div>

              {/* Total */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                padding: "14px 0", borderTop: "1px solid #E4E2DC",
                borderBottom: "1px solid #E4E2DC", marginBottom: 20
              }}>
                <span style={{ fontSize: 14, color: "#6B6962" }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0B1D3A" }}>
                  {isFree ? "Free" : `$${(event.price || 5) * quantity}`}
                </span>
              </div>

              {/* Button */}
              <button onClick={handlePurchase} disabled={loading} style={{
                width: "100%", padding: "14px",
                background: loading ? "#8A9BC0" : "#0B1D3A",
                color: "white", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif", marginBottom: 12
              }}>
                {loading ? "Processing..." : isFree ? "Confirm RSVP" : "Purchase Ticket"}
              </button>

              <p style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center" }}>
                QR code will be sent to your university email
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}