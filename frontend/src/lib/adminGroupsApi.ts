import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export const CLUB_CATEGORIES = ["Cultural", "Academic", "Arts", "Religious", "Sports", "Political", "Technology", "Social"]
export const SPORT_SUGGESTIONS = ["Football", "Basketball", "Swimming", "Athletics", "Rugby", "Tennis", "Cricket", "Volleyball"]

export type GroupKind = "CLUB" | "SOCIETY" | "TEAM"
export type GroupStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED"

export interface GroupLeader {
  id: string
  name: string
  studentId: string
}

export interface ClubGroup {
  id: string
  name: string
  description: string | null
  category: string
  type: "CLUB" | "SOCIETY"
  status: GroupStatus
  members: number
  leaders: GroupLeader[]
}

export interface TeamGroup {
  id: string
  name: string
  description: string | null
  sport: string
  season: string | null
  status: GroupStatus
  members: number
  leaders: GroupLeader[]
}

export interface GroupList {
  clubs: ClubGroup[]
  teams: TeamGroup[]
}

export interface StudentHit {
  id: string
  name: string
  email: string
  studentId: string
  role: string
  isActive: boolean
  managedClub: { name: string } | null
  managedTeam: { name: string } | null
}

export interface NewGroup {
  kind: GroupKind
  name: string
  description?: string
  category?: string
  sport?: string
  season?: string
  leaderId?: string
}

export interface GroupEdit {
  name: string
  description: string
  category?: string
  type?: "CLUB" | "SOCIETY"
  sport?: string
  season?: string
}

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
    const detail = Array.isArray(json.errors)
      ? json.errors.map((e: { msg: string }) => e.msg).join(", ")
      : ""
    throw new Error(json.message === "Validation error" && detail ? detail : json.message || "Request failed")
  }
  return { data: json.data as T, message: json.message as string }
}

export const listGroups = async () => (await call<GroupList>("/api/admin/groups")).data
export const createGroup = async (g: NewGroup) => (await call<{ id: string }>("/api/admin/groups", "POST", g)).message
export const updateGroup = async (kind: "club" | "team", id: string, edit: GroupEdit) =>
  (await call<null>(`/api/admin/groups/${kind}/${id}`, "PUT", edit)).message
export const setGroupStatus = async (kind: "club" | "team", id: string, status: "ACTIVE" | "INACTIVE") =>
  (await call<null>(`/api/admin/groups/${kind}/${id}/status`, "PUT", { status })).message

export const searchStudents = async (query: string) => {
  const list = (await call<StudentHit[]>(`/api/admin/users?search=${encodeURIComponent(query)}`)).data
  return list.filter(u => u.role !== "ADMIN" && u.isActive)
}

export const assignLeader = async (userId: string, groupType: "CLUB" | "TEAM" | "NONE", groupId?: string) =>
  (await call<null>(`/api/admin/users/${userId}/leader`, "PUT", { groupType, groupId })).message