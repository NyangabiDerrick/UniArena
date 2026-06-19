"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"

const mockUsers = [
  { id:"1", name:"John Student", email:"student@university.ac", role:"STUDENT", faculty:"Computer Science", studentId:"UA-2024-001", isActive:true, joinedAt:"Jan 2026" },
  { id:"2", name:"Jane Leader", email:"leader@university.ac", role:"CLUB_LEADER", faculty:"Business", studentId:"UA-2024-002", isActive:true, joinedAt:"Jan 2026" },
  { id:"3", name:"Mike Captain", email:"captain@university.ac", role:"SPORTS_CAPTAIN", faculty:"Sports Science", studentId:"UA-2024-003", isActive:true, joinedAt:"Jan 2026" },
  { id:"4", name:"Sarah Admin", email:"admin@university.ac", role:"ADMIN", faculty:"Administration", studentId:"UA-2024-004", isActive:true, joinedAt:"Jan 2026" },
  { id:"5", name:"Dr. Smith", email:"lecturer@university.ac", role:"LECTURER", faculty:"Computer Science", studentId:"UA-STAFF-001", isActive:true, joinedAt:"Jan 2026" },
]

const roleBadge: Record<string, { bg: string; text: string }> = {
  STUDENT: { bg: "#F1F5F9", text: "#475569" },
  CLUB_LEADER: { bg: "#EFF6FF", text: "#1D4ED8" },
  SPORTS_CAPTAIN: { bg: "#F0FDF4", text: "#15803D" },
  LECTURER: { bg: "#F5F3FF", text: "#6D28D9" },
  MODERATOR: { bg: "#FFF7ED", text: "#C2410C" },
  ADMIN: { bg: "#FEF2F2", text: "#DC2626" },
}

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

  const filtered = users.filter(u => {
    const ms = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const mr = roleFilter === "ALL" || u.role === roleFilter
    return ms && mr
  })

  const handleSuspend = (id: string) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, isActive: !u.isActive } : u
    ))
  }

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4
        }}>User Management</h1>
        <p style={{ fontSize: 14, color: "#6B6962" }}>
          Manage all platform users, roles and access
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: "white", borderRadius: 14, padding: "18px 20px",
        border: "1px solid #E4E2DC", marginBottom: 16,
        display: "flex", gap: 12, flexWrap: "wrap"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{
            position: "absolute", left: 12, top: "50%",
            transform: "translateY(-50%)", color: "#9CA3AF"
          }} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 12px 9px 36px",
              fontSize: 13, borderRadius: 8,
              border: "1.5px solid #E4E2DC", outline: "none",
              fontFamily: "'Inter', sans-serif"
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={14} color="#9CA3AF" />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{
              padding: "9px 12px", fontSize: 13, borderRadius: 8,
              border: "1.5px solid #E4E2DC", outline: "none",
              fontFamily: "'Inter', sans-serif", background: "white",
              cursor: "pointer"
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="CLUB_LEADER">Club Leader</option>
            <option value="SPORTS_CAPTAIN">Sports Captain</option>
            <option value="LECTURER">Lecturer</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "white", borderRadius: 14,
        border: "1px solid #E4E2DC", overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E4E2DC" }}>
              {["Name", "Email", "Role", "Faculty", "Status", "Actions"].map(h => (
                <th key={h} style={{
                  padding: "12px 16px", textAlign: "left",
                  fontSize: 12, fontWeight: 600, color: "#6B6962"
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => {
              const badge = roleBadge[user.role] || { bg: "#F1F5F9", text: "#475569" }
              return (
                <tr key={user.id} style={{
                  borderBottom: i < filtered.length - 1 ? "1px solid #F3F4F6" : "none"
                }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: "#EFF6FF", color: "#1D4ED8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 13, flexShrink: 0
                      }}>{user.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#0B1D3A" }}>
                          {user.name}
                        </p>
                        <p style={{ fontSize: 11, color: "#9CA3AF" }}>{user.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B6962" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "3px 10px",
                      borderRadius: 99, background: badge.bg, color: badge.text
                    }}>{user.role}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#6B6962" }}>
                    {user.faculty}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: "3px 10px",
                      borderRadius: 99,
                      background: user.isActive ? "#F0FDF4" : "#FEF2F2",
                      color: user.isActive ? "#15803D" : "#DC2626"
                    }}>
                      {user.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button style={{
                        fontSize: 12, fontWeight: 500, color: "#1D4ED8",
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "'Inter', sans-serif"
                      }}>Edit</button>
                      <button
                        onClick={() => handleSuspend(user.id)}
                        style={{
                          fontSize: 12, fontWeight: 500,
                          color: user.isActive ? "#DC2626" : "#15803D",
                          background: "none", border: "none", cursor: "pointer",
                          fontFamily: "'Inter', sans-serif"
                        }}
                      >
                        {user.isActive ? "Suspend" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#6B6962" }}>No users found matching your search</p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: "12px 16px", borderTop: "1px solid #E4E2DC",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <p style={{ fontSize: 12, color: "#9CA3AF" }}>
            Showing {filtered.length} of {users.length} users
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{
              fontSize: 12, padding: "6px 14px", borderRadius: 8,
              border: "1px solid #E4E2DC", background: "white",
              cursor: "pointer", fontFamily: "'Inter', sans-serif"
            }}>Previous</button>
            <button style={{
              fontSize: 12, padding: "6px 14px", borderRadius: 8,
              border: "1px solid #E4E2DC", background: "white",
              cursor: "pointer", fontFamily: "'Inter', sans-serif"
            }}>Next</button>
          </div>
        </div>
      </div>

    </div>
  )
}