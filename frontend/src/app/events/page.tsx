"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import type { Event } from "@/lib/types"
import { categoryLabel, eventCategory, eventSold, formatEventDate, formatEventTime } from "@/lib/format"

const filters = [
  { label: "All", value: "ALL" },
  { label: "Club", value: "CLUB" },
  { label: "Sports", value: "SPORTS" },
  { label: "University", value: "UNIVERSITY" },
  { label: "Academic", value: "ACADEMIC" },
  { label: "Social", value: "SOCIAL" }
]

const catColors: Record<string, { bg: string; text: string }> = {
  CLUB: { bg: "#EFF6FF", text: "#1D4ED8" },
  SPORTS: { bg: "#FFF7ED", text: "#C2410C" },
  UNIVERSITY: { bg: "#F5F3FF", text: "#6D28D9" },
  ACADEMIC: { bg: "#F0FDF4", text: "#15803D" },
  SOCIAL: { bg: "#FDF2F8", text: "#A21CAF" }
}

const badge = (bg: string, text: string): React.CSSProperties => ({
  fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: bg, color: text
})

const statusOf = (e: Event) => (e as { status?: string }).status

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("ALL")
  const [freeOnly, setFreeOnly] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      api.getEvents({ search, free: freeOnly })
        .then(res => { if (!cancelled) setEvents(res.data) })
        .catch(err => console.error("Failed to fetch events:", err))
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [search, freeOnly])

  const filtered = events.filter(e => selected === "ALL" || eventCategory(e) === selected)

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>Events</h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Discover upcoming events across clubs, sports and the university</p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} style={{
              width: "100%", padding: "11px 14px 11px 40px", fontSize: 13, borderRadius: 10,
              border: "1.5px solid #E4E2DC", background: "white", color: "#1A1916",
              outline: "none", fontFamily: "'Inter', sans-serif"
            }} />
          </div>
          <label style={{
            display: "flex", alignItems: "center", gap: 8, padding: "0 16px", background: "white",
            border: "1.5px solid #E4E2DC", borderRadius: 10, fontSize: 13, cursor: "pointer",
            color: "#6B6962", whiteSpace: "nowrap"
          }}>
            <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} />
            Free only
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {filters.map(f => (
            <button key={f.value} onClick={() => setSelected(f.value)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
              border: "1.5px solid", cursor: "pointer",
              borderColor: selected === f.value ? "#0B1D3A" : "#E4E2DC",
              background: selected === f.value ? "#0B1D3A" : "white",
              color: selected === f.value ? "white" : "#6B6962",
              fontFamily: "'Inter', sans-serif"
            }}>{f.label}</button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filtered.map(event => {
              const capacity = event.capacity ?? 0
              const sold = eventSold(event)
              const spotsLeft = Math.max(0, capacity - sold)
              const pct = capacity ? Math.min(100, Math.round((sold / capacity) * 100)) : 0
              const cancelled = statusOf(event) === "CANCELLED"
              const ended = !!event.endsAt && new Date(event.endsAt) < new Date()
              const unavailable = cancelled || ended || spotsLeft === 0 || !event.isFree
              const key = eventCategory(event)
              const cat = catColors[key] || { bg: "#F1F5F9", text: "#475569" }

              return (
                <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "white", borderRadius: 14, padding: "22px 24px", border: "1px solid #E4E2DC", opacity: cancelled ? 0.75 : 1, transition: "box-shadow 0.2s, transform 0.2s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 8px 24px rgba(11,29,58,0.10)"; el.style.transform = "translateY(-1px)" }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "translateY(0)" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                          <span style={badge(cat.bg, cat.text)}>{categoryLabel(key)}</span>
                          {cancelled && <span style={badge("#FEF2F2", "#DC2626")}>Cancelled</span>}
                          {!cancelled && ended && <span style={badge("#F3F4F6", "#6B7280")}>Ended</span>}
                          {event.isFree && <span style={badge("#F0FDF4", "#15803D")}>Free</span>}
                          {!cancelled && !ended && spotsLeft === 0 && <span style={badge("#FEF2F2", "#DC2626")}>Sold out</span>}
                        </div>

                        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 6, textDecoration: cancelled ? "line-through" : "none" }}>{event.title}</h3>
                        <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 14, lineHeight: 1.5 }}>{event.description}</p>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={13} />{formatEventDate(event)}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} />{formatEventTime(event)}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} />{event.venue}</span>
                          {!cancelled && <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={13} />{spotsLeft} spots left</span>}
                        </div>

                        {!cancelled && (
                          <>
                            <div style={{ height: 4, background: "#F3F4F6", borderRadius: 99, overflow: "hidden", maxWidth: 300 }}>
                              <div style={{ height: "100%", borderRadius: 99, background: pct >= 90 ? "#DC2626" : pct >= 70 ? "#F97316" : "#0B1D3A", width: `${pct}%` }} />
                            </div>
                            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{sold} / {capacity} registered</p>
                          </>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>
                        <p style={{ fontSize: 20, fontWeight: 700, color: "#0B1D3A", fontFamily: "'Playfair Display', serif" }}>
                          {event.isFree ? "Free" : "Paid"}
                        </p>
                        <span style={{
                          fontSize: 12, fontWeight: 600, padding: "8px 18px", borderRadius: 8,
                          background: unavailable ? "#F3F4F6" : "#0B1D3A", color: unavailable ? "#9CA3AF" : "white"
                        }}>
                          {cancelled ? "Cancelled" : ended ? "Ended" : spotsLeft === 0 ? "Sold out" : event.isFree ? "RSVP" : "Payments soon"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 14, color: "#6B6962" }}>No events found</p>
          </div>
        )}

      </div>
    </MainLayout>
  )
}