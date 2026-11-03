"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import * as T from "@/lib/sportsToolsApi"

type Tab = "fixtures" | "squad" | "training"

const input: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif", background: "white" }
const lab: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "#0B1D3A", marginBottom: 5 }
const card: React.CSSProperties = { background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 22 }
const primary: React.CSSProperties = { padding: "10px 18px", borderRadius: 10, border: "none", background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }
const link = (c: string): React.CSSProperties => ({ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, color: c, fontFamily: "'Inter', sans-serif", padding: 0 })
const badge = (bg: string, text: string): React.CSSProperties => ({ fontSize: 11, padding: "2px 9px", borderRadius: 99, fontWeight: 500, background: bg, color: text })

const msg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong")
const when = (d: string) => new Date(d).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

// ISO time -> the value a datetime-local input expects, in the viewer's own time zone
const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

const emptyFixture = { opposition: "", venue: "", isHome: true, when: "", notes: "", ours: "", theirs: "" }
const emptyPlayer = { studentId: "", position: "", jersey: "" }
const emptyTraining = { day: "1", start: "16:00", end: "18:00", venue: "" }
const emptyEdit = { opposition: "", venue: "", isHome: true, when: "", notes: "" }

export default function ManageTeamPage() {
  const { data: session, status } = useSession()
  const role = session?.user?.role
  const isAdmin = role === "ADMIN"
  const permitted = isAdmin || role === "CLUB_LEADER"

  const [teams, setTeams] = useState<T.TeamSummary[]>([])
  const [teamId, setTeamId] = useState("")
  const [team, setTeam] = useState<T.TeamDetail | null>(null)
  const [tab, setTab] = useState<Tab>("fixtures")
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)
  const [fx, setFx] = useState(emptyFixture)
  const [pl, setPl] = useState(emptyPlayer)
  const [tr, setTr] = useState(emptyTraining)
  const [scores, setScores] = useState<Record<string, { ours: string; theirs: string }>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ef, setEf] = useState(emptyEdit)
  const [correctingId, setCorrectingId] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "authenticated" || !permitted) return
    let cancelled = false
    const load = isAdmin ? T.listTeams() : T.getMyTeam().then(t => [t])
    load
      .then(list => {
        if (cancelled) return
        setTeams(list)
        setTeamId(prev => prev || list[0]?.id || "")
        if (list.length === 0) setLoading(false)
      })
      .catch(e => { if (!cancelled) { setError(msg(e)); setLoading(false) } })
    return () => { cancelled = true }
  }, [status, permitted, isAdmin])

  useEffect(() => {
    if (!teamId) return
    let cancelled = false
    T.getManageView(teamId)
      .then(t => { if (!cancelled) setTeam(t) })
      .catch(e => { if (!cancelled) setError(msg(e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [teamId, reloadKey])

  const run = async (fn: () => Promise<string>, after?: () => void) => {
    setNotice("")
    setError("")
    try {
      setNotice(await fn())
      after?.()
      setReloadKey(k => k + 1)
    } catch (e) {
      setError(msg(e))
    }
  }

  const startEdit = (f: T.FixtureItem) => {
    setEditingId(f.id)
    setEf({ opposition: f.opposition, venue: f.venue, isHome: f.isHome, when: toLocalInput(f.scheduledAt), notes: f.notes ?? "" })
  }

  const startCorrect = (f: T.FixtureItem) => {
    const { ours, theirs } = T.scoresOf(f)
    setCorrectingId(f.id)
    setScores(prev => ({ ...prev, [f.id]: { ours: String(ours ?? ""), theirs: String(theirs ?? "") } }))
  }

  const tabBtn = (t: Tab): React.CSSProperties => ({
    padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif",
    background: tab === t ? "white" : "transparent", color: tab === t ? "#0B1D3A" : "#6B6962", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none"
  })

  if (status === "authenticated" && !permitted) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only team leaders and administrators can manage a team.</p></MainLayout>
  }

  if (!loading && !teamId) {
    return (
      <MainLayout>
        <div style={{ ...card, maxWidth: 520, margin: "60px auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A", marginBottom: 8 }}>No team to manage</h2>
          <p style={{ fontSize: 14, color: "#6B6962", lineHeight: 1.6 }}>{error || "You have not been assigned a sports team yet."} An administrator assigns leaders. If you were just assigned, sign out and in again.</p>
        </div>
      </MainLayout>
    )
  }

  const now = new Date()
  const upcoming = team?.fixtures.filter(f => f.status !== "COMPLETED") ?? []
  const results = (team?.fixtures.filter(f => f.status === "COMPLETED") ?? []).slice().reverse()
  const newIsPast = fx.when !== "" && new Date(fx.when) < now

  return (
    <MainLayout>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>{team?.name ?? "Manage team"}</h1>
            <p style={{ fontSize: 14, color: "#6B6962" }}>{team?.sport} · fixtures, squad and training</p>
          </div>
          {isAdmin && teams.length > 1 && (
            <select value={teamId} onChange={e => { setTeamId(e.target.value); setTeam(null); setEditingId(null); setCorrectingId(null) }} style={{ ...input, width: 240 }}>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", gap: 4, background: "#F3F4F6", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 22 }}>
          <button style={tabBtn("fixtures")} onClick={() => setTab("fixtures")}>Fixtures</button>
          <button style={tabBtn("squad")} onClick={() => setTab("squad")}>Squad ({team?.squadMembers.length ?? 0})</button>
          <button style={tabBtn("training")} onClick={() => setTab("training")}>Training</button>
        </div>

        {loading || !team ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : tab === "fixtures" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <form style={card} onSubmit={e => {
              e.preventDefault()
              if (newIsPast && (fx.ours === "" || fx.theirs === "")) { setError("That date has passed. Enter the final score."); return }
              run(
                () => T.createFixture(teamId, {
                  opposition: fx.opposition.trim(), venue: fx.venue.trim(), isHome: fx.isHome,
                  scheduledAt: new Date(fx.when).toISOString(), notes: fx.notes.trim() || undefined,
                  ...(newIsPast ? { ourScore: Number(fx.ours), theirScore: Number(fx.theirs) } : {})
                }),
                () => setFx(emptyFixture)
              )
            }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 14 }}>Add a fixture or a past result</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><label style={lab}>Opponent</label><input value={fx.opposition} onChange={e => setFx({ ...fx, opposition: e.target.value })} required maxLength={100} style={input} /></div>
                <div><label style={lab}>Venue</label><input value={fx.venue} onChange={e => setFx({ ...fx, venue: e.target.value })} required maxLength={150} style={input} /></div>
                <div><label style={lab}>Date and time</label><input type="datetime-local" value={fx.when} onChange={e => setFx({ ...fx, when: e.target.value })} required style={input} /></div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", alignSelf: "end", paddingBottom: 10 }}>
                  <input type="checkbox" checked={fx.isHome} onChange={e => setFx({ ...fx, isHome: e.target.checked })} /> Home match
                </label>
              </div>

              {newIsPast && (
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                  <p style={{ fontSize: 13, color: "#92400E", marginBottom: 10 }}>This date has passed, so it will be saved as a result. Enter the final score.</p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" min={0} placeholder="Us" value={fx.ours} onChange={e => setFx({ ...fx, ours: e.target.value })} required style={{ ...input, width: 80 }} />
                    <span>-</span>
                    <input type="number" min={0} placeholder="Them" value={fx.theirs} onChange={e => setFx({ ...fx, theirs: e.target.value })} required style={{ ...input, width: 80 }} />
                  </div>
                </div>
              )}

              <input value={fx.notes} onChange={e => setFx({ ...fx, notes: e.target.value })} maxLength={500} placeholder="Notes (optional)" style={{ ...input, marginBottom: 14 }} />
              <button type="submit" style={primary}>{newIsPast ? "Save result" : "Add fixture"}</button>
              <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 12 }}>The squad is notified.</span>
            </form>

            <div style={card}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 14 }}>Upcoming</h2>
              {upcoming.length === 0 ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>No upcoming fixtures.</p> : upcoming.map(f => {
                const s = scores[f.id] ?? { ours: "", theirs: "" }
                const overdue = new Date(f.scheduledAt) < now
                const editing = editingId === f.id
                return (
                  <div key={f.id} style={{ padding: "12px 0", borderTop: "1px solid #F3F4F6" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      vs {f.opposition}
                      <span style={{ fontWeight: 400, color: "#9CA3AF", fontSize: 12 }}>{f.isHome ? "Home" : "Away"}</span>
                      {overdue && <span style={badge("#FFFBEB", "#92400E")}>Result needed</span>}
                    </p>
                    <p style={{ fontSize: 12, color: "#9CA3AF", margin: "3px 0 10px" }}>{when(f.scheduledAt)} · {f.venue}{f.notes ? ` · ${f.notes}` : ""}</p>

                    {editing ? (
                      <form onSubmit={e => {
                        e.preventDefault()
                        run(
                          () => T.updateFixture(teamId, f.id, {
                            opposition: ef.opposition.trim(), venue: ef.venue.trim(), isHome: ef.isHome,
                            scheduledAt: new Date(ef.when).toISOString(), notes: ef.notes.trim() || null
                          }),
                          () => setEditingId(null)
                        )
                      }} style={{ background: "#F8F7F4", borderRadius: 10, padding: 14 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                          <div><label style={lab}>Opponent</label><input value={ef.opposition} onChange={e => setEf({ ...ef, opposition: e.target.value })} required maxLength={100} style={input} /></div>
                          <div><label style={lab}>Venue</label><input value={ef.venue} onChange={e => setEf({ ...ef, venue: e.target.value })} required maxLength={150} style={input} /></div>
                          <div><label style={lab}>Date and time</label><input type="datetime-local" value={ef.when} onChange={e => setEf({ ...ef, when: e.target.value })} required style={input} /></div>
                          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#374151", alignSelf: "end", paddingBottom: 10 }}>
                            <input type="checkbox" checked={ef.isHome} onChange={e => setEf({ ...ef, isHome: e.target.checked })} /> Home match
                          </label>
                        </div>
                        <input value={ef.notes} onChange={e => setEf({ ...ef, notes: e.target.value })} maxLength={500} placeholder="Notes (optional)" style={{ ...input, marginBottom: 10 }} />
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <button type="submit" style={primary}>Save changes</button>
                          <button type="button" style={link("#6B6962")} onClick={() => setEditingId(null)}>Cancel</button>
                          <span style={{ fontSize: 12, color: "#9CA3AF" }}>A new time or venue notifies the squad.</span>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input type="number" min={0} placeholder="Us" value={s.ours} onChange={e => setScores({ ...scores, [f.id]: { ...s, ours: e.target.value } })} style={{ ...input, width: 70 }} />
                        <span>-</span>
                        <input type="number" min={0} placeholder="Them" value={s.theirs} onChange={e => setScores({ ...scores, [f.id]: { ...s, theirs: e.target.value } })} style={{ ...input, width: 70 }} />
                        <button style={link("#15803D")} onClick={() => run(() => T.saveResult(teamId, f.id, Number(s.ours), Number(s.theirs)))} disabled={s.ours === "" || s.theirs === ""}>Save result</button>
                        <button style={link("#1D4ED8")} onClick={() => startEdit(f)}>Edit</button>
                        <button style={link("#DC2626")} onClick={() => window.confirm("Delete this fixture?") && run(() => T.deleteFixture(teamId, f.id))}>Delete</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={card}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 14 }}>Results</h2>
              {results.length === 0 ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>No results yet.</p> : results.map(f => {
                const { ours, theirs } = T.scoresOf(f)
                const s = scores[f.id] ?? { ours: "", theirs: "" }
                const correcting = correctingId === f.id
                return (
                  <div key={f.id} style={{ padding: "10px 0", borderTop: "1px solid #F3F4F6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, fontSize: 14 }}>
                      <span style={{ color: "#0B1D3A" }}>vs {f.opposition} <span style={{ color: "#9CA3AF", fontSize: 12 }}>{when(f.scheduledAt)}</span></span>
                      <span style={{ display: "flex", gap: 14, alignItems: "center" }}>
                        <strong style={{ color: "#0B1D3A" }}>{ours} - {theirs}</strong>
                        {!correcting && <button style={link("#1D4ED8")} onClick={() => startCorrect(f)}>Correct score</button>}
                      </span>
                    </div>
                    {correcting && (
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                        <input type="number" min={0} placeholder="Us" value={s.ours} onChange={e => setScores({ ...scores, [f.id]: { ...s, ours: e.target.value } })} style={{ ...input, width: 70 }} />
                        <span>-</span>
                        <input type="number" min={0} placeholder="Them" value={s.theirs} onChange={e => setScores({ ...scores, [f.id]: { ...s, theirs: e.target.value } })} style={{ ...input, width: 70 }} />
                        <button style={link("#15803D")} disabled={s.ours === "" || s.theirs === ""}
                          onClick={() => run(() => T.saveResult(teamId, f.id, Number(s.ours), Number(s.theirs)), () => setCorrectingId(null))}>Save correction</button>
                        <button style={link("#6B6962")} onClick={() => setCorrectingId(null)}>Cancel</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : tab === "squad" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <form style={card} onSubmit={e => {
              e.preventDefault()
              run(() => T.addPlayer(teamId, { studentId: pl.studentId.trim(), position: pl.position.trim() || undefined, jerseyNumber: pl.jersey === "" ? undefined : Number(pl.jersey) }), () => setPl(emptyPlayer))
            }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 14 }}>Add a player</h2>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div><label style={lab}>Registration number</label><input value={pl.studentId} onChange={e => setPl({ ...pl, studentId: e.target.value })} required placeholder="BSCCS/2024/30303" style={input} /></div>
                <div><label style={lab}>Position</label><input value={pl.position} onChange={e => setPl({ ...pl, position: e.target.value })} maxLength={40} placeholder="Striker" style={input} /></div>
                <div><label style={lab}>Jersey no.</label><input type="number" min={0} max={99} value={pl.jersey} onChange={e => setPl({ ...pl, jersey: e.target.value })} style={input} /></div>
              </div>
              <button type="submit" style={primary}>Add to squad</button>
              <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 12 }}>The student must already have an account.</span>
            </form>

            <div style={card}>
              {team.squadMembers.length === 0 ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>No players yet.</p> : team.squadMembers.map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #F3F4F6" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{m.jerseyNumber !== null ? `#${m.jerseyNumber} ` : ""}{m.user.name}{m.isInjured && <span style={{ marginLeft: 8, fontSize: 11, color: "#DC2626" }}>Injured</span>}</p>
                    <p style={{ fontSize: 12, color: "#9CA3AF" }}>{m.user.studentId}{m.position ? ` · ${m.position}` : ""}</p>
                  </div>
                  <div style={{ display: "flex", gap: 14 }}>
                    <button style={link("#92400E")} onClick={() => run(() => T.setInjured(teamId, m.id, !m.isInjured))}>{m.isInjured ? "Mark fit" : "Mark injured"}</button>
                    <button style={link("#DC2626")} onClick={() => window.confirm(`Remove ${m.user.name}?`) && run(() => T.removePlayer(teamId, m.id))}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <form style={card} onSubmit={e => {
              e.preventDefault()
              run(() => T.addTraining(teamId, { dayOfWeek: Number(tr.day), startTime: tr.start, endTime: tr.end, venue: tr.venue.trim() }), () => setTr(emptyTraining))
            }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 14 }}>Add a training session</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: 12, marginBottom: 14 }}>
                <div><label style={lab}>Day</label><select value={tr.day} onChange={e => setTr({ ...tr, day: e.target.value })} style={input}>{T.DAYS.slice(1).map((d, i) => <option key={d} value={i + 1}>{d}</option>)}</select></div>
                <div><label style={lab}>From</label><input type="time" value={tr.start} onChange={e => setTr({ ...tr, start: e.target.value })} required style={input} /></div>
                <div><label style={lab}>To</label><input type="time" value={tr.end} onChange={e => setTr({ ...tr, end: e.target.value })} required style={input} /></div>
                <div><label style={lab}>Venue</label><input value={tr.venue} onChange={e => setTr({ ...tr, venue: e.target.value })} required maxLength={150} style={input} /></div>
              </div>
              <button type="submit" style={primary}>Add session</button>
            </form>

            <div style={card}>
              {team.trainingSessions.length === 0 ? <p style={{ fontSize: 13, color: "#9CA3AF" }}>No training sessions yet.</p> : team.trainingSessions.map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #F3F4F6" }}>
                  <span style={{ fontSize: 14, color: "#0B1D3A" }}><strong>{T.DAYS[s.dayOfWeek]}</strong> {s.startTime} - {s.endTime} · {s.venue}</span>
                  <button style={link("#DC2626")} onClick={() => run(() => T.deleteTraining(teamId, s.id))}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}