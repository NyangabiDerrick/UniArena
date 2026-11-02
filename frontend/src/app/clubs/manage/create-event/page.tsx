"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { inputStyle, labelStyle, primaryButton, errorBox, successBox } from "@/components/layout/AuthShell"
import { getEventCategories, createEvent, CATEGORY_LABELS, type EventCategory } from "@/lib/contentApi"

export default function CreateEventPage() {
  const { data: session, status } = useSession()
  const [allowed, setAllowed] = useState<EventCategory[] | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [venue, setVenue] = useState("")
  const [description, setDescription] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [capacity, setCapacity] = useState("50")
  const [isFree, setIsFree] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState("")

  const role = session?.user?.role
  const permitted = role === "CLUB_LEADER" || role === "ADMIN"

  useEffect(() => {
    if (status !== "authenticated" || !permitted) return
    getEventCategories()
      .then(setAllowed)
      .catch(e => setError(e instanceof Error ? e.message : "Could not load categories"))
  }, [status, permitted])

  const chosen = (category || allowed?.[0] || "") as EventCategory | ""

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setDone("")
    if (!chosen) return setError("Pick a category")

    const start = new Date(startsAt)
    const end = new Date(endsAt)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return setError("Enter a start and end time")
    if (end <= start) return setError("The event must end after it starts")
    if (start < new Date()) return setError("The start time must be in the future")

    setBusy(true)
    try {
      const message = await createEvent({
        title: title.trim(), category: chosen, venue: venue.trim(), description: description.trim(),
        startsAt: start.toISOString(), endsAt: end.toISOString(),
        capacity: Number(capacity), isFree
      })
      setDone(message)
      setTitle(""); setVenue(""); setDescription(""); setStartsAt(""); setEndsAt("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the event")
    } finally {
      setBusy(false)
    }
  }

  if (status === "authenticated" && !permitted) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only club leaders and administrators can create events.</p></MainLayout>
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>Create an event</h1>
        <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 28 }}>
          {role === "ADMIN" ? "Events you create are published straight away." : "Your event is reviewed by an administrator before it appears."}
        </p>

        {error && <div style={errorBox}>{error}</div>}
        {done && <div style={successBox}>{done}</div>}

        {allowed && allowed.length === 0 ? (
          <div style={errorBox}>You haven&apos;t been assigned a club, society or team yet, so you can&apos;t create events.</div>
        ) : (
          <form onSubmit={submit} style={{ background: "white", borderRadius: 16, border: "1px solid #E4E2DC", padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <select value={chosen} onChange={e => setCategory(e.target.value)} required style={inputStyle}>
                {(allowed ?? []).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Venue</label>
              <input value={venue} onChange={e => setVenue(e.target.value)} required maxLength={200} style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Starts</label>
                <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Ends</label>
                <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "end" }}>
              <div>
                <label style={labelStyle}>Capacity</label>
                <input type="number" min={1} max={100000} value={capacity} onChange={e => setCapacity(e.target.value)} required style={inputStyle} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", paddingBottom: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={isFree} onChange={e => setIsFree(e.target.checked)} />
                Free event
              </label>
            </div>
            {!isFree && (
              <p style={{ fontSize: 12, color: "#92400E", background: "#FFFBEB", padding: "8px 12px", borderRadius: 8 }}>
                Online payments aren&apos;t available yet. A paid event is listed, but students will see &ldquo;Payments coming soon&rdquo; instead of a ticket button.
              </p>
            )}

            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} maxLength={3000}
                placeholder="What is happening, who is it for, anything to bring? Leave a blank line between paragraphs."
                style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <button type="submit" disabled={busy || !allowed} style={primaryButton(busy || !allowed)}>
              {busy ? "Saving..." : role === "ADMIN" ? "Publish event" : "Submit for approval"}
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  )
}