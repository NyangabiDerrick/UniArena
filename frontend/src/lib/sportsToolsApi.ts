import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export interface TeamSummary { id: string; name: string; sport: string }

export interface FixtureItem {
  id: string
  opposition: string
  venue: string
  isHome: boolean
  scheduledAt: string
  status: string
  homeScore: number | null
  awayScore: number | null
  notes: string | null
}

export interface SquadEntry {
  id: string
  position: string | null
  jerseyNumber: number | null
  isInjured: boolean
  user: { name: string; studentId?: string }
}

export interface TrainingItem { id: string; dayOfWeek: number; startTime: string; endTime: string; venue: string; notes: string | null }

export interface TeamDetail {
  id: string
  name: string
  sport: string
  description: string | null
  season: string | null
  fixtures: FixtureItem[]
  squadMembers: SquadEntry[]
  trainingSessions: TrainingItem[]
}

export interface FixtureDetails {
  opposition?: string
  venue?: string
  isHome?: boolean
  scheduledAt?: string
  notes?: string | null
}

// Our score and their score, whichever side the fixture was home or away for
export const scoresOf = (f: FixtureItem) => ({
  ours: f.isHome ? f.homeScore : f.awayScore,
  theirs: f.isHome ? f.awayScore : f.homeScore
})

async function call<T>(path: string, method = "GET", body?: unknown): Promise<{ data: T; message: string }> {
  const session = await getSession()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = Array.isArray(json.errors) ? json.errors.map((e: { path?: string; msg: string }) => `${e.path ?? "field"}: ${e.msg}`).join(", ") : ""
    throw new Error(json.message === "Validation error" && detail ? detail : json.message || "Request failed")
  }
  return { data: json.data as T, message: json.message as string }
}

export const listTeams = async () => (await call<TeamSummary[]>("/api/sports")).data
export const getMyTeam = async () => (await call<TeamSummary>("/api/sports/mine")).data
export const getPublicTeam = async (id: string) => (await call<TeamDetail>(`/api/sports/${id}`)).data
export const getManageView = async (id: string) => (await call<TeamDetail>(`/api/sports/${id}/manage`)).data

export const createFixture = async (
  id: string,
  b: { opposition: string; venue: string; isHome: boolean; scheduledAt: string; notes?: string; ourScore?: number; theirScore?: number }
) => (await call<null>(`/api/sports/${id}/fixtures`, "POST", b)).message

export const updateFixture = async (id: string, fixtureId: string, b: FixtureDetails) =>
  (await call<null>(`/api/sports/${id}/fixtures/${fixtureId}`, "PUT", b)).message

export const saveResult = async (id: string, fixtureId: string, ours: number, theirs: number) =>
  (await call<null>(`/api/sports/${id}/fixtures/${fixtureId}`, "PUT", { status: "COMPLETED", ourScore: ours, theirScore: theirs })).message

export const deleteFixture = async (id: string, fixtureId: string) =>
  (await call<null>(`/api/sports/${id}/fixtures/${fixtureId}`, "DELETE")).message

export const addPlayer = async (id: string, b: { studentId: string; position?: string; jerseyNumber?: number }) =>
  (await call<null>(`/api/sports/${id}/squad`, "POST", b)).message
export const setInjured = async (id: string, memberId: string, isInjured: boolean) =>
  (await call<null>(`/api/sports/${id}/squad/${memberId}`, "PUT", { isInjured })).message
export const removePlayer = async (id: string, memberId: string) =>
  (await call<null>(`/api/sports/${id}/squad/${memberId}`, "DELETE")).message

export const addTraining = async (id: string, b: { dayOfWeek: number; startTime: string; endTime: string; venue: string }) =>
  (await call<null>(`/api/sports/${id}/training`, "POST", b)).message
export const deleteTraining = async (id: string, sessionId: string) =>
  (await call<null>(`/api/sports/${id}/training/${sessionId}`, "DELETE")).message