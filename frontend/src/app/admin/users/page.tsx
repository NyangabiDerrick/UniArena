"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Search, Filter, X } from "lucide-react"
import { api } from "@/lib/api"

const roleBadge: Record<string, { bg: string; text: string; label: string }> = {
  STUDENT: { bg: "#F1F5F9", text: "#475569", label: "Student" },
  CLUB_LEADER: { bg: "#EFF6FF", text: "#1D4ED8", label: "Leader" },
  ADMIN: { bg: "#FEF2F2", text: "#DC2626", label: "Admin" }
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [assigning, setAssigning] = useState<any>(null)
  const [choice, setChoice] = useState("")

  const load = useCallback(async () => {
    try {
      const res = await api.getAdminUsers({ role: roleFilter, search })
      setUsers(res.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [roleFilter, search])

  useEffect(() => {
    if (status !== "authenticated") return
    load()
  }, [status, load])

  useEffect(() => {
    if (status !== "authenticated") return
    api.getClubs().then(r => setClubs(r.data)).catch(() => {})
    api.getTeams().then(r => setTeams(r.data)).catch(() => {})
  }, [status])

  const run = async (action: () => Promise<any>) => {
    setError("")
    setNotice("")
    try {
      const res = await action()
      setNotice(res.message)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const toggleActive = (u: any) => run(() => api.updateUser(u.id, { isActive: !u.isActive }))
  const removeLeader = (u: any) => run(() => api.assignLeader(u.id, { groupType: "NONE" }))

  const saveAssignment = async () => {
    if (!choice) return
    const [groupType, groupId] = choice.split(":")
    await run(() => api.assignLeader(assigning.id, { groupType: groupType as "CLUB" | "TEAM", groupId }))
    setAssigning(null)
    setChoice("")
  }

  const linkBtn = (color: string): React.CSSProperties => ({
    fontSize: 12, fontWeight: 500, color, background: "none", border: "none",
    cursor: "pointer", fontFamily: "'Inter', sans-serif", padding: 0
  })

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>
          User Management
        </h1>
        <p style={{ fontSize: 14, color: "#6B6962" }}>Manage users, assign leaders and control access</p>
      </div>

      {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
      {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

      <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #E4E2DC", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 12px 9px 36px", fontSize: 13, borderRadius: 8, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} color="#9CA3AF" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: "9px 12px", fontSize: 13, borderRadius: 8, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif", background: "white" }}>
            <option value="ALL">All roles</option>
            <option value="STUDENT">Students</option>
            <option value="CLUB_LEADER">Leaders</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E4E2DC" }}>
              {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6B6962" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const badge = roleBadge[u.role] || { bg: "#F1F5F9", text: "#475569", label: u.role }
              const group = u.managedClub?.name || u.managedTeam?.name
              const isMe = u.email === session?.user?.email
              return (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>{u.name}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>{u.studentId}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B6962" }}>{u.email}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99, background: badge.bg, color: badge.text }}>
                      {badge.label}{u.role === "CLUB_LEADER" ? ` · ${group || "unassigned"}` : ""}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 99, background: u.isActive ? "#F0FDF4" : "#FEF2F2", color: u.isActive ? "#15803D" : "#DC2626" }}>
                      {u.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {u.role === "ADMIN" || isMe ? (
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>
                    ) : (
                      <div style={{ display: "flex", gap: 14 }}>
                        <button style={linkBtn("#1D4ED8")} onClick={() => { setAssigning(u); setChoice("") }}>
                          {u.role === "CLUB_LEADER" ? "Change group" : "Make leader"}
                        </button>
                        {u.role === "CLUB_LEADER" && <button style={linkBtn("#C2410C")} onClick={() => removeLeader(u)}>Remove leader</button>}
                        <button style={linkBtn(u.isActive ? "#DC2626" : "#15803D")} onClick={() => toggleActive(u)}>
                          {u.isActive ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!loading && users.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", fontSize: 14, color: "#6B6962" }}>No users found</div>
        )}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #E4E2DC", fontSize: 12, color: "#9CA3AF" }}>
          {users.length} user{users.length !== 1 ? "s" : ""}
        </div>
      </div>

      {assigning && (
        <div onClick={() => setAssigning(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 28, width: "min(440px, 90vw)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A" }}>Assign leader</h2>
              <button onClick={() => setAssigning(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 20 }}>
              {assigning.name} will manage only the group you choose. They must sign out and in again to see leader menus.
            </p>
            <select value={choice} onChange={e => setChoice(e.target.value)}
              style={{ width: "100%", padding: "11px 12px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", marginBottom: 20, fontFamily: "'Inter', sans-serif" }}>
              <option value="">Select a club, society or team…</option>
              <optgroup label="Clubs and societies">
                {clubs.map(c => <option key={c.id} value={`CLUB:${c.id}`}>{c.name} ({c.type === "SOCIETY" ? "Society" : "Club"})</option>)}
              </optgroup>
              <optgroup label="Sports teams">
                {teams.map(t => <option key={t.id} value={`TEAM:${t.id}`}>{t.name}</option>)}
              </optgroup>
            </select>
            <button onClick={saveAssignment} disabled={!choice}
              style={{ width: "100%", padding: 13, borderRadius: 10, border: "none", background: choice ? "#0B1D3A" : "#8A9BC0", color: "white", fontSize: 14, fontWeight: 600, cursor: choice ? "pointer" : "not-allowed", fontFamily: "'Inter', sans-serif" }}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}