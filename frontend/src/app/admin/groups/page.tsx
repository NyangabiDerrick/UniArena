"use client"

import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Plus, Search, X, Pencil, Archive, RotateCcw, Users } from "lucide-react"
import { inputStyle, labelStyle, primaryButton, errorBox } from "@/components/layout/AuthShell"
import {
  listGroups, createGroup, updateGroup, setGroupStatus, searchStudents, assignLeader,
  CLUB_CATEGORIES, SPORT_SUGGESTIONS,
  type GroupList, type GroupKind, type GroupLeader, type StudentHit
} from "@/lib/adminGroupsApi"

interface Row {
  key: string
  id: string
  kind: GroupKind
  name: string
  detail: string
  description: string | null
  season: string | null
  status: string
  members: number
  leaders: GroupLeader[]
}

const KIND_LABEL: Record<GroupKind, string> = { CLUB: "Club", SOCIETY: "Society", TEAM: "Sports team" }
const KIND_COLOR: Record<GroupKind, { bg: string; text: string }> = {
  CLUB: { bg: "#EFF6FF", text: "#1D4ED8" },
  SOCIETY: { bg: "#F5F3FF", text: "#6D28D9" },
  TEAM: { bg: "#FFF7ED", text: "#C2410C" }
}

const msg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong")

const pill = (active: boolean): React.CSSProperties => ({
  padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 500, border: "1.5px solid", cursor: "pointer",
  borderColor: active ? "#0B1D3A" : "#E4E2DC", background: active ? "#0B1D3A" : "white",
  color: active ? "white" : "#6B6962", fontFamily: "'Inter', sans-serif"
})

const smallBtn = (color: string): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8,
  border: "1.5px solid #E4E2DC", background: "white", cursor: "pointer", color,
  fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif"
})

const badge = (bg: string, text: string): React.CSSProperties => ({
  fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500, background: bg, color: text
})

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, padding: 28, width: "min(520px, 100%)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A" }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function LeaderPicker({ picked, onPick }: { picked: StudentHit | null; onPick: (s: StudentHit | null) => void }) {
  const [q, setQ] = useState("")
  const [hits, setHits] = useState<StudentHit[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (q.trim().length < 2) return
    let cancelled = false
    const timer = setTimeout(() => {
      setSearching(true)
      searchStudents(q.trim())
        .then(list => { if (!cancelled) setHits(list) })
        .catch(() => { if (!cancelled) setHits([]) })
        .finally(() => { if (!cancelled) setSearching(false) })
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [q])

  const visible = q.trim().length < 2 ? [] : hits

  if (picked) {
    const current = picked.managedClub?.name || picked.managedTeam?.name
    return (
      <div style={{ border: "1.5px solid #C9A84C", background: "#FFFBF0", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{picked.name}</p>
          <p style={{ fontSize: 12, color: "#6B6962" }}>{picked.studentId}</p>
          {current && <p style={{ fontSize: 12, color: "#92400E", marginTop: 4 }}>Currently leads {current}. They will move to this group.</p>}
        </div>
        <button type="button" onClick={() => onPick(null)} style={smallBtn("#374151")}>Change</button>
      </div>
    )
  }

  return (
    <div>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or email (the email starts with the registration number)" style={inputStyle} />
      {q.trim().length >= 2 && (
        <div style={{ border: "1px solid #E4E2DC", borderRadius: 10, marginTop: 8, maxHeight: 190, overflowY: "auto" }}>
          {searching && visible.length === 0 ? (
            <p style={{ padding: 12, fontSize: 13, color: "#9CA3AF" }}>Searching...</p>
          ) : visible.length === 0 ? (
            <p style={{ padding: 12, fontSize: 13, color: "#9CA3AF" }}>No matching account. The person must register first.</p>
          ) : visible.map(s => (
            <div key={s.id} onClick={() => onPick(s)} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #F3F4F6" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{s.name}</p>
              <p style={{ fontSize: 11, color: "#9CA3AF" }}>{s.studentId} · {s.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GroupForm({ editing, onClose, onDone }: { editing: Row | null; onClose: () => void; onDone: (message: string) => void }) {
  const [kind, setKind] = useState<GroupKind>(editing?.kind ?? "CLUB")
  const [name, setName] = useState(editing?.name ?? "")
  const [description, setDescription] = useState(editing?.description ?? "")
  const [category, setCategory] = useState(editing && editing.kind !== "TEAM" ? editing.detail : CLUB_CATEGORIES[0])
  const [sport, setSport] = useState(editing?.kind === "TEAM" ? editing.detail : "")
  const [season, setSeason] = useState(editing?.season ?? "")
  const [leader, setLeader] = useState<StudentHit | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const isTeam = kind === "TEAM"

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError("")
    try {
      let message: string
      if (editing) {
        message = await updateGroup(
          editing.kind === "TEAM" ? "team" : "club",
          editing.id,
          isTeam
            ? { name: name.trim(), description: description.trim(), sport: sport.trim(), season: season.trim() }
            : { name: name.trim(), description: description.trim(), category, type: kind === "SOCIETY" ? "SOCIETY" : "CLUB" }
        )
      } else {
        message = await createGroup({
          kind,
          name: name.trim(),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(isTeam ? { sport: sport.trim(), ...(season.trim() ? { season: season.trim() } : {}) } : { category }),
          ...(leader ? { leaderId: leader.id } : {})
        })
      }
      onDone(message)
    } catch (err) {
      setError(msg(err))
      setBusy(false)
    }
  }

  return (
    <Modal title={editing ? `Edit ${editing.name}` : "Add a club, society or team"} onClose={onClose}>
      {error && <div style={errorBox}>{error}</div>}
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(!editing || editing.kind !== "TEAM") && (
          <div>
            <label style={labelStyle}>Type</label>
            <select value={kind} onChange={e => setKind(e.target.value as GroupKind)} style={inputStyle}>
              <option value="CLUB">Club</option>
              <option value="SOCIETY">Society</option>
              {!editing && <option value="TEAM">Sports team</option>}
            </select>
          </div>
        )}

        <div>
          <label style={labelStyle}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={100} style={inputStyle} />
        </div>

        {isTeam ? (
          <>
            <div>
              <label style={labelStyle}>Sport</label>
              <input value={sport} onChange={e => setSport(e.target.value)} list="sport-suggestions" required minLength={2} maxLength={40} placeholder="Football" style={inputStyle} />
              <datalist id="sport-suggestions">
                {SPORT_SUGGESTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label style={labelStyle}>Season (optional)</label>
              <input value={season} onChange={e => setSeason(e.target.value)} maxLength={20} placeholder="2025/26" style={inputStyle} />
            </div>
          </>
        ) : (
          <div>
            <label style={labelStyle}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {CLUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        <div>
          <label style={labelStyle}>Description (optional)</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} maxLength={1000}
            placeholder="What the group does, who can join, when it meets."
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {!editing && (
          <div>
            <label style={labelStyle}>Leader (optional)</label>
            <LeaderPicker picked={leader} onPick={setLeader} />
            <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>You can also assign leaders later. The person needs a registered account.</p>
          </div>
        )}

        <button type="submit" disabled={busy} style={primaryButton(busy)}>
          {busy ? "Saving..." : editing ? "Save changes" : "Add to UniArena"}
        </button>
      </form>
    </Modal>
  )
}

function LeaderForm({ row, onClose, onDone }: { row: Row; onClose: () => void; onDone: (message: string) => void }) {
  const [picked, setPicked] = useState<StudentHit | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const save = async () => {
    if (!picked) return
    setBusy(true)
    setError("")
    try {
      onDone(await assignLeader(picked.id, row.kind === "TEAM" ? "TEAM" : "CLUB", row.id))
    } catch (err) {
      setError(msg(err))
      setBusy(false)
    }
  }

  return (
    <Modal title={`Add a leader to ${row.name}`} onClose={onClose}>
      {error && <div style={errorBox}>{error}</div>}
      <p style={{ fontSize: 13, color: "#6B6962", marginBottom: 14, lineHeight: 1.6 }}>
        The person manages only this group. They must sign out and in again to see their leader tools.
      </p>
      <LeaderPicker picked={picked} onPick={setPicked} />
      <button onClick={save} disabled={!picked || busy} style={{ ...primaryButton(!picked || busy), marginTop: 18 }}>
        {busy ? "Saving..." : "Make leader"}
      </button>
    </Modal>
  )
}

export default function GroupsPage() {
  const { data: session, status } = useSession()
  const [data, setData] = useState<GroupList | null>(null)
  const [loading, setLoading] = useState(true)
  const [kindFilter, setKindFilter] = useState<"ALL" | GroupKind>("ALL")
  const [showArchived, setShowArchived] = useState(false)
  const [search, setSearch] = useState("")
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [leaderFor, setLeaderFor] = useState<Row | null>(null)

  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return
    let cancelled = false
    listGroups()
      .then(d => { if (!cancelled) setData(d) })
      .catch(e => { if (!cancelled) setError(msg(e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [status, isAdmin, reloadKey])

  const rows: Row[] = useMemo(() => {
    if (!data) return []
    const clubRows: Row[] = data.clubs.map(c => ({
      key: `c-${c.id}`, id: c.id, kind: c.type, name: c.name, detail: c.category,
      description: c.description, season: null, status: c.status, members: c.members, leaders: c.leaders
    }))
    const teamRows: Row[] = data.teams.map(t => ({
      key: `t-${t.id}`, id: t.id, kind: "TEAM", name: t.name, detail: t.sport,
      description: t.description, season: t.season, status: t.status, members: t.members, leaders: t.leaders
    }))
    return [...clubRows, ...teamRows]
  }, [data])

  const visible = rows.filter(r => {
    const archived = r.status === "INACTIVE" || r.status === "SUSPENDED"
    if (archived !== showArchived) return false
    if (kindFilter !== "ALL" && r.kind !== kindFilter) return false
    if (search.trim() && !r.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    return true
  })

  const act = async (fn: () => Promise<string>) => {
    setError("")
    setNotice("")
    try {
      setNotice(await fn())
      setReloadKey(k => k + 1)
    } catch (e) {
      setError(msg(e))
    }
  }

  const finished = (message: string) => {
    setFormOpen(false)
    setEditing(null)
    setLeaderFor(null)
    setError("")
    setNotice(message)
    setReloadKey(k => k + 1)
  }

  const archive = (r: Row) => {
    if (!window.confirm(`Archive ${r.name}? It disappears from the public lists. Its leaders and history are kept.`)) return
    act(() => setGroupStatus(r.kind === "TEAM" ? "team" : "club", r.id, "INACTIVE"))
  }
  const activate = (r: Row) => act(() => setGroupStatus(r.kind === "TEAM" ? "team" : "club", r.id, "ACTIVE"))
  const removeLeader = (l: GroupLeader, r: Row) => {
    if (!window.confirm(`Remove ${l.name} as leader of ${r.name}? They become an ordinary student again.`)) return
    act(() => assignLeader(l.id, "NONE"))
  }

  if (status === "authenticated" && !isAdmin) {
    return <p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only administrators can manage clubs, societies and teams.</p>
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Clubs, societies and teams</h1>
          <p style={{ fontSize: 14, color: "#6B6962" }}>Enter the real groups on campus and choose who leads each one.</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true) }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 18px", borderRadius: 10, border: "none", background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
          <Plus size={15} /> Add group
        </button>
      </div>

      {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
            style={{ width: "100%", padding: "10px 12px 10px 36px", fontSize: 13, borderRadius: 10, border: "1.5px solid #E4E2DC", background: "white", outline: "none", fontFamily: "'Inter', sans-serif" }} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([["ALL", "All"], ["CLUB", "Clubs"], ["SOCIETY", "Societies"], ["TEAM", "Sports teams"]] as const).map(([value, label]) => (
            <button key={value} onClick={() => setKindFilter(value)} style={pill(kindFilter === value)}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowArchived(false)} style={pill(!showArchived)}>Active</button>
          <button onClick={() => setShowArchived(true)} style={pill(showArchived)}>Archived</button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
      ) : visible.length === 0 ? (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 56, textAlign: "center" }}>
          <Users size={36} color="#E4E2DC" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, color: "#6B6962" }}>
            {showArchived ? "Nothing is archived." : "No groups match. Press Add group to enter the first one."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {visible.map(r => {
            const color = KIND_COLOR[r.kind]
            const pending = r.status === "PENDING"
            const archived = r.status === "INACTIVE" || r.status === "SUSPENDED"
            return (
              <div key={r.key} style={{ background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: "20px 24px", opacity: archived ? 0.8 : 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={badge(color.bg, color.text)}>{KIND_LABEL[r.kind]}</span>
                      <span style={badge("#F1F5F9", "#475569")}>{r.detail}</span>
                      {r.season && <span style={badge("#F1F5F9", "#475569")}>Season {r.season}</span>}
                      {pending && <span style={badge("#FFFBEB", "#92400E")}>Waiting for approval</span>}
                      {archived && <span style={badge("#F3F4F6", "#6B7280")}>Archived</span>}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0B1D3A", marginBottom: 6 }}>{r.name}</h3>
                    {r.description && <p style={{ fontSize: 13, color: "#6B6962", lineHeight: 1.6, marginBottom: 8 }}>{r.description}</p>}
                    <p style={{ fontSize: 12, color: "#9CA3AF" }}>{r.members} {r.kind === "TEAM" ? "players" : "members"}</p>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignContent: "flex-start" }}>
                    <button onClick={() => { setEditing(r); setFormOpen(true) }} style={smallBtn("#0B1D3A")}><Pencil size={13} /> Edit</button>
                    <button onClick={() => setLeaderFor(r)} style={smallBtn("#1D4ED8")}><Plus size={13} /> Leader</button>
                    {pending && <button onClick={() => activate(r)} style={smallBtn("#15803D")}>Approve</button>}
                    {archived ? (
                      <button onClick={() => activate(r)} style={smallBtn("#15803D")}><RotateCcw size={13} /> Restore</button>
                    ) : (
                      <button onClick={() => archive(r)} style={smallBtn("#DC2626")}><Archive size={13} /> Archive</button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#6B6962" }}>Leaders:</span>
                  {r.leaders.length === 0 ? (
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>None yet</span>
                  ) : r.leaders.map(l => (
                    <span key={l.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 6px 4px 12px", borderRadius: 99, background: "#FFFBF0", border: "1px solid #E8D89A", color: "#0B1D3A" }}>
                      {l.name}
                      <button onClick={() => removeLeader(l, r)} aria-label={`Remove ${l.name}`}
                        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", color: "#92400E", padding: 2 }}>
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {formOpen && (
        <GroupForm editing={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onDone={finished} />
      )}
      {leaderFor && (
        <LeaderForm row={leaderFor} onClose={() => setLeaderFor(null)} onDone={finished} />
      )}
    </div>
  )
}