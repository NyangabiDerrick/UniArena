"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

const categories = ["All","Club","Sports","University","Academic","Social"]

const mockEvents = [
  { id:"1", title:"Annual Sports Day", description:"The biggest sporting event of the year featuring competitions across 10 sports.", category:"Sports", date:"June 7, 2026", time:"9:00 AM", venue:"Main Stadium", organiser:"Sports Department", capacity:500, sold:342, isFree:true, price:0 },
  { id:"2", title:"Photography Exhibition", description:"Annual showcase of the best photography work from our Photography Society members.", category:"Club", date:"June 10, 2026", time:"2:00 PM", venue:"Arts Building Gallery", organiser:"Photography Society", capacity:150, sold:89, isFree:true, price:0 },
  { id:"3", title:"Entrepreneurship Pitch Night", description:"Student entrepreneurs pitch their startup ideas to a panel of industry judges.", category:"Academic", date:"June 12, 2026", time:"6:00 PM", venue:"Business School Auditorium", organiser:"Entrepreneurship Club", capacity:200, sold:167, isFree:false, price:5 },
  { id:"4", title:"African Culture Night", description:"A celebration of African heritage through music, dance, food and art.", category:"Social", date:"June 15, 2026", time:"7:00 PM", venue:"Student Union Hall", organiser:"African Culture Society", capacity:300, sold:201, isFree:false, price:10 },
  { id:"5", title:"Inter-University Debate", description:"UniArena's debate team takes on teams from 5 other universities.", category:"Academic", date:"June 18, 2026", time:"10:00 AM", venue:"Law Faculty Moot Room", organiser:"Debate Society", capacity:100, sold:45, isFree:true, price:0 },
  { id:"6", title:"End of Year Concert", description:"The biggest social event of the year featuring live performances and DJ sets.", category:"Social", date:"June 25, 2026", time:"8:00 PM", venue:"Open Air Amphitheatre", organiser:"Student Union", capacity:1000, sold:876, isFree:false, price:15 },
]

const catColors: Record<string, { bg: string; text: string }> = {
  Club: { bg: "#EFF6FF", text: "#1D4ED8" },
  Sports: { bg: "#FFF7ED", text: "#C2410C" },
  University: { bg: "#F5F3FF", text: "#6D28D9" },
  Academic: { bg: "#F0FDF4", text: "#15803D" },
  Social: { bg: "#FDF2F8", text: "#A21CAF" },
}

export default function EventsPage() {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState("All")
  const [freeOnly, setFreeOnly] = useState(false)

  const filtered = mockEvents.filter(e => {
    const ms = e.title.toLowerCase().includes(search.toLowerCase()) || e.organiser.toLowerCase().includes(search.toLowerCase())
    const mc = selected === "All" || e.category === selected
    const mf = !freeOnly || e.isFree
    return ms && mc && mf
  })

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>
            Events
          </h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Discover upcoming events across clubs, sports and the university</p>
        </div>

        {/* Search + free toggle */}
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
            display: "flex", alignItems: "center", gap: 8,
            padding: "0 16px", background: "white", border: "1.5px solid #E4E2DC",
            borderRadius: 10, fontSize: 13, cursor: "pointer", color: "#6B6962",
            whiteSpace: "nowrap"
          }}>
            <input type="checkbox" checked={freeOnly} onChange={e => setFreeOnly(e.target.checked)} />
            Free only
          </label>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelected(cat)} style={{
              padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500,
              border: "1.5px solid", cursor: "pointer",
              borderColor: selected === cat ? "#0B1D3A" : "#E4E2DC",
              background: selected === cat ? "#0B1D3A" : "white",
              color: selected === cat ? "white" : "#6B6962",
              fontFamily: "'Inter', sans-serif"
            }}>{cat}</button>
          ))}
        </div>

        {/* Events list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map(event => {
            const spotsLeft = event.capacity - event.sold
            const pct = Math.round((event.sold / event.capacity) * 100)
            const cat = catColors[event.category] || { bg: "#F1F5F9", text: "#475569" }
            return (
              <Link key={event.id} href={`/events/${event.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "white", borderRadius: 14, padding: "22px 24px",
                  border: "1px solid #E4E2DC",
                  transition: "box-shadow 0.2s, transform 0.2s"
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = "0 8px 24px rgba(11,29,58,0.10)"
                    el.style.transform = "translateY(-1px)"
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = "none"
                    el.style.transform = "translateY(0)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 24 }}>
                    <div style={{ flex: 1 }}>
                      {/* Badges */}
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: cat.bg, color: cat.text }}>
                          {event.category}
                        </span>
                        {event.isFree && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: "#F0FDF4", color: "#15803D" }}>Free</span>}
                        {spotsLeft === 0 && <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: "#FEF2F2", color: "#DC2626" }}>Sold Out</span>}
                      </div>

                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 6 }}>{event.title}</h3>
                      <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 14, lineHeight: 1.5 }}>{event.description}</p>

                      {/* Meta */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Calendar size={13} />{event.date}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} />{event.time}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} />{event.venue}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Users size={13} />{spotsLeft} spots left</span>
                      </div>

                      {/* Progress */}
                      <div style={{ height: 4, background: "#F3F4F6", borderRadius: 99, overflow: "hidden", maxWidth: 300 }}>
                        <div style={{
                          height: "100%", borderRadius: 99,
                          background: pct >= 90 ? "#DC2626" : pct >= 70 ? "#F97316" : "#0B1D3A",
                          width: `${pct}%`
                        }} />
                      </div>
                      <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{event.sold} / {event.capacity} registered</p>
                    </div>

                    {/* Price + CTA */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>
                      <p style={{ fontSize: 20, fontWeight: 700, color: "#0B1D3A", fontFamily: "'Playfair Display', serif" }}>
                        {event.isFree ? "Free" : `$${event.price}`}
                      </p>
                      <span style={{
                        fontSize: 12, fontWeight: 600, padding: "8px 18px", borderRadius: 8,
                        background: spotsLeft === 0 ? "#F3F4F6" : "#0B1D3A",
                        color: spotsLeft === 0 ? "#9CA3AF" : "white"
                      }}>
                        {spotsLeft === 0 ? "Sold Out" : event.isFree ? "RSVP" : "Get Ticket"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 14, color: "#6B6962" }}>No events found</p>
          </div>
        )}

      </div>
    </MainLayout>
  )
}