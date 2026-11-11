"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { listGroups } from "@/lib/adminGroupsApi"
import { api, type GroupInsights } from "@/lib/api"
import { errorMessage } from "@/lib/types"

interface GroupOption {
  id: string
  name: string
  type: string
}

const card: React.CSSProperties = { background: "white", borderRadius: 14, border: "1px solid #E4E2DC" }

const reasonLabels: Record<string, string> = {
  SCHEDULE_CLASH: "Clashes with classes or exams",
  NO_LONGER_INTERESTED: "No longer interested",
  MOVING_ON: "Graduating or moving on",
  COST: "Cost or fees",
  NOT_WELCOMING: "The group is not welcoming",
  OTHER: "Something else",
  PREFER_NOT_TO_SAY: "Prefer not to say"
}

export default function AdminInsightsPage() {
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  const [groups, setGroups] = useState<GroupOption[]>([])
  const [selected, setSelected] = useState("")
  const [result, setResult] = useState<{ id: string; insights: GroupInsights | null; error: string } | null>(null)
  const [groupsError, setGroupsError] = useState("")

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return
    let cancelled = false
    listGroups()
      .then(d => {
        if (cancelled) return
        const clubs = d.clubs.map(c => ({ id: c.id, name: c.name, type: c.type }))
        setGroups(clubs)
        setSelected(prev => prev || clubs[0]?.id || "")
      })
      .catch(e => { if (!cancelled) setGroupsError(errorMessage(e)) })
    return () => { cancelled = true }
  }, [status, isAdmin])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    api.getGroupInsights(selected)
      .then(res => { if (!cancelled) setResult({ id: selected, insights: res.data, error: "" }) })
      .catch(e => { if (!cancelled) setResult({ id: selected, insights: null, error: errorMessage(e) }) })
    return () => { cancelled = true }
  }, [selected])

  if (status === "authenticated" && !isAdmin) {
    return <p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only administrators can view group insights.</p>
  }

  // Results belong to the group they were fetched for, so switching group shows "loading"
  const ready = result?.id === selected ? result : null
  const loading = !!selected && !ready
  const insights = ready?.insights ?? null
  const error = groupsError || ready?.error || ""
  const current = groups.find(g => g.id === selected)
  const maxReason = Math.max(1, ...(insights?.reasons.map(r => r.count) ?? [1]))
  const monthKeys = Object.keys(insights?.monthly ?? {}).sort()

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Group insights</h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Membership trends for any club or society. Totals only, with no names.</p>
        </div>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          style={{ width: 300, padding: "10px 12px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", background: "white", fontFamily: "'Inter', sans-serif" }}>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name} ({g.type === "SOCIETY" ? "society" : "club"})</option>
          ))}
        </select>
      </div>

      {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

      {groups.length === 0 && !error && (
        <div style={{ ...card, padding: 48, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#6B6962" }}>No clubs or societies yet. Add some under Groups first.</p>
        </div>
      )}

      {loading && <p style={{ textAlign: "center", padding: 40, fontSize: 14, color: "#9CA3AF" }}>Loading insights...</p>}

      {!loading && insights && current && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div style={{ ...card, padding: 22 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A" }}>{insights.joinedInWindow}</p>
              <p style={{ fontSize: 12, color: "#6B6962", marginTop: 4 }}>Joined in the last {insights.windowDays} days</p>
            </div>
            <div style={{ ...card, padding: 22 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A" }}>{insights.leftInWindow}</p>
              <p style={{ fontSize: 12, color: "#6B6962", marginTop: 4 }}>Left in the last {insights.windowDays} days</p>
            </div>
            <div style={{ ...card, padding: 22 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A" }}>{insights.activeMembers}</p>
              <p style={{ fontSize: 12, color: "#6B6962", marginTop: 4 }}>Active members now</p>
            </div>
          </div>

          <div style={{ ...card, padding: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 4 }}>Why members left</h2>
            <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>Anonymous totals from members who chose to share a reason.</p>
            {insights.reasons.length === 0 ? (
              <p style={{ fontSize: 13, color: "#6B6962" }}>No one has left in this period.</p>
            ) : insights.reasons.map(r => (
              <div key={r.reason} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#0B1D3A", marginBottom: 4 }}>
                  <span>{reasonLabels[r.reason] ?? r.reason}</span>
                  <span style={{ color: "#6B6962" }}>{r.count}</span>
                </div>
                <div style={{ height: 8, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(r.count / maxReason) * 100}%`, background: "#0B1D3A", borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ ...card, padding: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#0B1D3A", marginBottom: 14 }}>Joins by month</h2>
            {monthKeys.length === 0 ? (
              <p style={{ fontSize: 13, color: "#6B6962" }}>No joins in this period.</p>
            ) : monthKeys.map(k => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderTop: "1px solid #F3F4F6", color: "#0B1D3A" }}>
                <span>{new Date(`${k}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>
                <span>{insights.monthly[k].joined}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}