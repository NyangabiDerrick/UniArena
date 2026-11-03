"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import MainLayout from "@/components/layout/MainLayout"
import { CalendarX, X } from "lucide-react"
import { getManagedEvents, changeEvent, type ManagedEvent, type EventAction } from "@/lib/eventModerationApi"

const when = (d: string) =>
  new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })

const field: React.CSSProperties = {
  width: "100%", padding: "11px 12px", fontSize: 14, borderRadius: 10,
  border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif"
}

const badge = (bg: string, text: string): React.CSSProperties => ({
  fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: bg, color: text
})

const btn = (color: string): React.CSSProperties => ({
  padding: "7px 12px", borderRadius: 8, border: "1.5px solid #E4E2DC", background: "white",
  cursor: "pointer", color, fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif"
})

export default function ManageEventsPage() {
  const { data: session, status } = useSession()
  const [events, setEvents] = useState<ManagedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [acting, setActing] = useState<{ event: ManagedEvent; action: "cancel" | "suspend" } | null>(null)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [modalError, setModalError] = useState("")

  const role = session?.user?.role
  const isAdmin = role === "ADMIN"
  const permitted = isAdmin || role === "CLUB_LEADER"

  useEffect(() => {
    if (status !== "authenticated" || !permitted) return
    let cancelled = false
    getManagedEvents()
      .then(list => { if (!cancelled) setEvents(list) })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load events") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [status, permitted, reloadKey])

  const run = async (event: ManagedEvent, action: EventAction, why?: string) => {
    setNotice("")
    setError("")
    try {
      setNotice(await changeEvent(event.id, action, why))
      setReloadKey(k => k + 1)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed")
      return false
    }
  }

  const confirmAction = async () => {
    if (!acting) return
    if (reason.trim().length < 5) return setModalError("Give a reason of at least 5 characters")
    setBusy(true)
    setModalError("")
    try {
      setNotice(await changeEvent(acting.event.id, acting.action, reason.trim()))
      setError("")
      setActing(null)
      setReason("")
      setReloadKey(k => k + 1)
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "Action failed")
    } finally {
      setBusy(false)
    }
  }

  if (status === "authenticated" && !permitted) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only club leaders and administrators can manage events.</p></MainLayout>
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Manage events</h1>
            <p style={{ fontSize: 14, color: "#6B6962" }}>
              {isAdmin ? "Every event on campus." : "Events of your group."} Cancelling tells ticket holders. Suspending hides the event from students.
            </p>
          </div>
          <Link href="/clubs/manage/create-event" style={{ padding: "10px 18px", borderRadius: 10, background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Create event
          </Link>
        </div>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        {loading ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : events.length === 0 ? (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 56, textAlign: "center" }}>
            <CalendarX size={36} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14, color: "#6B6962" }}>No events yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {events.map(ev => {
              const ended = new Date(ev.endsAt) < new Date()
              const locked = !isAdmin && ev.suspendedByAdmin
              const group = ev.club?.name || ev.team?.name || "University"
              return (
                <div key={ev.id} style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        {ev.status === "APPROVED" && !ended && <span style={badge("#F0FDF4", "#15803D")}>Published</span>}
                        {ev.status === "APPROVED" && ended && <span style={badge("#F3F4F6", "#6B7280")}>Ended</span>}
                        {ev.status === "CANCELLED" && <span style={badge("#FEF2F2", "#DC2626")}>Cancelled</span>}
                        {ev.status === "SUSPENDED" && <span style={badge("#FFFBEB", "#92400E")}>{ev.suspendedByAdmin ? "Suspended by an administrator" : "Suspended"}</span>}
                        {ev.status === "PENDING" && <span style={badge("#EFF6FF", "#1D4ED8")}>Pending</span>}
                        <span style={badge("#F1F5F9", "#475569")}>{group}</span>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#0B1D3A", marginBottom: 4 }}>{ev.title}</p>
                      <p style={{ fontSize: 12, color: "#9CA3AF" }}>{when(ev.startsAt)} · {ev.venue} · {ev._count.tickets} / {ev.capacity} tickets</p>
                      {ev.moderationNote && (ev.status === "CANCELLED" || ev.status === "SUSPENDED") && (
                        <p style={{ fontSize: 12, color: "#6B6962", marginTop: 8 }}>Reason: {ev.moderationNote}</p>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignContent: "flex-start" }}>
                      {locked ? (
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>Only an administrator can change this</span>
                      ) : (
                        <>
                          {ev.status === "APPROVED" && (
                            <button onClick={() => { setActing({ event: ev, action: "suspend" }); setReason(""); setModalError("") }} style={btn("#92400E")}>Suspend</button>
                          )}
                          {(ev.status === "APPROVED" || ev.status === "SUSPENDED") && !ended && (
                            <button onClick={() => { setActing({ event: ev, action: "cancel" }); setReason(""); setModalError("") }} style={btn("#DC2626")}>Cancel event</button>
                          )}
                          {ev.status === "SUSPENDED" && (
                            <button onClick={() => run(ev, "restore")} style={btn("#15803D")}>Restore</button>
                          )}
                          {ev.status === "CANCELLED" && isAdmin && (
                            <button onClick={() => run(ev, "restore")} style={btn("#15803D")}>Reinstate</button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {acting && (
        <div onClick={() => setActing(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 28, width: "min(480px, 100%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A" }}>
                {acting.action === "cancel" ? "Cancel this event?" : "Suspend this event?"}
              </h2>
              <button onClick={() => setActing(null)} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 16, lineHeight: 1.6 }}>
              <strong>{acting.event.title}</strong>.{" "}
              {acting.action === "cancel"
                ? "It stays visible marked Cancelled, with your reason. Everyone holding a ticket is notified."
                : "It disappears from the public lists until it is restored. Ticket holders are not told."}
            </p>
            {modalError && <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 12, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{modalError}</div>}
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} maxLength={500}
              placeholder={acting.action === "cancel" ? "Why is it cancelled? Ticket holders will read this." : "Why is it being suspended?"}
              style={{ ...field, resize: "vertical", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setActing(null)} style={{ ...btn("#374151"), flex: 1, padding: 12 }}>Keep as is</button>
              <button onClick={confirmAction} disabled={busy}
                style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: busy ? "#8A9BC0" : acting.action === "cancel" ? "#DC2626" : "#92400E", color: "white", fontSize: 13, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", fontFamily: "'Inter', sans-serif" }}>
                {busy ? "Saving..." : acting.action === "cancel" ? "Cancel event" : "Suspend event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}