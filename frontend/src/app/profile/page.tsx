"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { api, type LeaveReason } from "@/lib/api"
import { errorMessage } from "@/lib/types"
import type { Profile } from "@/lib/types"

type ProfileData = Profile & {
  bio?: string | null
  clubMemberships?: { id: string; club?: { id: string; name: string; category: string; type?: string } }[]
}

const roleLabel: Record<string, string> = {
  STUDENT: "Student",
  CLUB_LEADER: "Leader",
  SPORTS_CAPTAIN: "Leader",
  LECTURER: "Staff",
  MODERATOR: "Moderator",
  ADMIN: "Admin"
}

const card: React.CSSProperties = { background: "white", borderRadius: 16, padding: 28, border: "1px solid #E4E2DC" }
const input: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif", background: "white" }
const lab: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "#0B1D3A", marginBottom: 6 }
const primary: React.CSSProperties = { padding: "10px 18px", borderRadius: 10, border: "none", background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }
const ghost: React.CSSProperties = { padding: "10px 18px", borderRadius: 10, border: "1.5px solid #E4E2DC", background: "white", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter', sans-serif" }
const linkBtn = (color: string): React.CSSProperties => ({ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color, fontFamily: "'Inter', sans-serif", padding: 0 })

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [reasons, setReasons] = useState<LeaveReason[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ faculty: "", yearOfStudy: "", bio: "" })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [leaving, setLeaving] = useState<{ clubId: string; clubName: string } | null>(null)
  const [reason, setReason] = useState("PREFER_NOT_TO_SAY")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (status !== "authenticated") return
    let cancelled = false
    api.getProfile()
      .then(res => {
        if (cancelled) return
        const p = res.data as ProfileData
        setProfile(p)
        setForm({
          faculty: p.faculty ?? "",
          yearOfStudy: p.yearOfStudy ? String(p.yearOfStudy) : "",
          bio: p.bio ?? ""
        })
      })
      .catch(err => { if (!cancelled) setError(errorMessage(err)) })
    return () => { cancelled = true }
  }, [status, reloadKey])

  useEffect(() => {
    if (status !== "authenticated") return
    api.getLeaveReasons()
      .then(res => setReasons(res.data))
      .catch(() => {})
  }, [status])

  const user = session?.user
  const memberships = (profile?.clubMemberships ?? []).filter(m => m.club)

  const startEdit = () => {
    setNotice("")
    setError("")
    setEditing(true)
  }

  const cancelEdit = () => {
    if (profile) {
      setForm({
        faculty: profile.faculty ?? "",
        yearOfStudy: profile.yearOfStudy ? String(profile.yearOfStudy) : "",
        bio: profile.bio ?? ""
      })
    }
    setEditing(false)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setNotice("")
    setError("")
    try {
      await api.updateProfile({
        faculty: form.faculty.trim() || null,
        yearOfStudy: form.yearOfStudy === "" ? null : Number(form.yearOfStudy),
        bio: form.bio.trim() || null
      })
      setNotice("Profile saved")
      setEditing(false)
      setReloadKey(k => k + 1)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const confirmLeave = async () => {
    if (!leaving) return
    setNotice("")
    setError("")
    try {
      await api.leaveGroup(leaving.clubId, reason)
      setNotice(`You have left ${leaving.clubName}`)
      setLeaving(null)
      setReason("PREFER_NOT_TO_SAY")
      setReloadKey(k => k + 1)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const field = (label: string, value?: string | number | null) => (
    <div>
      <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 14, color: "#0B1D3A", fontWeight: 500 }}>{value || "Not set"}</p>
    </div>
  )

  return (
    <MainLayout>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A" }}>My Profile</h1>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, background: "#0B1D3A", color: "#C9A84C",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 26
              }}>{user?.name?.charAt(0)}</div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0B1D3A" }}>{user?.name}</h2>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#EFF6FF", color: "#1D4ED8", fontWeight: 500 }}>
                  {roleLabel[user?.role || ""] || user?.role}
                </span>
              </div>
            </div>
            {!editing && <button onClick={startEdit} style={primary}>Edit profile</button>}
          </div>

          {!editing ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
                {field("Email", user?.email)}
                {field("Registration no.", user?.studentId)}
                {field("Faculty", profile?.faculty)}
                {field("Year of study", profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : null)}
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>About</p>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{profile?.bio || "Nothing written yet."}</p>
              </div>
            </>
          ) : (
            <form onSubmit={save} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                <div>
                  <label style={lab}>Faculty</label>
                  <input value={form.faculty} onChange={e => setForm({ ...form, faculty: e.target.value })} maxLength={100} placeholder="e.g. Science and Technology" style={input} />
                </div>
                <div>
                  <label style={lab}>Year of study</label>
                  <select value={form.yearOfStudy} onChange={e => setForm({ ...form, yearOfStudy: e.target.value })} style={input}>
                    <option value="">Not set</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={lab}>About you</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} maxLength={300} rows={3}
                  placeholder="A line about your interests" style={{ ...input, resize: "vertical" }} />
                <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{form.bio.length}/300</p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button type="submit" disabled={saving} style={{ ...primary, opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={cancelEdit} style={ghost}>Cancel</button>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>Name and registration number come from the university record.</span>
              </div>
            </form>
          )}
        </div>

        <div style={card}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 16 }}>My clubs, societies and teams</h2>

          {memberships.length === 0 ? (
            <p style={{ fontSize: 14, color: "#6B6962" }}>You haven&apos;t joined any clubs or societies yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {memberships.map(m => {
                const club = m.club!
                const isLeaving = leaving?.clubId === club.id
                return (
                  <div key={m.id} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 14, color: "#0B1D3A" }}>
                        {club.name}
                        <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8 }}>{club.category}</span>
                      </div>
                      {!isLeaving && (
                        <button onClick={() => { setLeaving({ clubId: club.id, clubName: club.name }); setReason("PREFER_NOT_TO_SAY") }} style={linkBtn("#DC2626")}>
                          Leave
                        </button>
                      )}
                    </div>

                    {isLeaving && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F3F4F6" }}>
                        <label style={lab}>Why are you leaving? (optional)</label>
                        <select value={reason} onChange={e => setReason(e.target.value)} style={{ ...input, marginBottom: 10 }}>
                          {reasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>
                          Your reason is shared only as part of anonymous totals for organisers. It is never shown next to your name.
                        </p>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <button onClick={confirmLeave} style={{ ...primary, background: "#DC2626" }}>Leave {club.name}</button>
                          <button onClick={() => setLeaving(null)} style={linkBtn("#6B6962")}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}