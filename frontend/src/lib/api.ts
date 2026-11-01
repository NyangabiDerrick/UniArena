import { getSession } from "next-auth/react"
import type { Analytics, Article, AuditLog, Club, Dashboard, Event, Fixture, Membership, MemberWithUser, Profile, Team, Ticket, User } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message: string }> {
  const session = await getSession()

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken
        ? { Authorization: `Bearer ${session.accessToken}` }
        : {}),
      ...options.headers
    }
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || "Request failed")
  }

  return res.json()
}

type Params = Record<string, string | boolean | undefined>

const cleanParams = (params?: Params): Record<string, string> =>
  Object.fromEntries(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)])
  )

export const api = {
  // Clubs
  getClubs: (params?: { category?: string; search?: string; type?: string }) => {
    const query = new URLSearchParams(cleanParams(params)).toString()
    return request<Club[]>(`/api/clubs${query ? `?${query}` : ""}`)
  },
  getClub: (id: string) => request<Club>(`/api/clubs/${id}`),
  getMyClub: () => request<Club>("/api/clubs/mine"),
  getMembershipStatus: (id: string) => request<{ status: string | null }>(`/api/clubs/${id}/membership`),
  getDashboard: () => request<Dashboard>("/api/users/dashboard"),
  createClub: (data: Partial<Club>) => request<Club>("/api/clubs", { method: "POST", body: JSON.stringify(data) }),
  joinClub: (id: string) => request<Membership>(`/api/clubs/${id}/join`, { method: "POST" }),
  getClubMembers: (id: string) => request<MemberWithUser[]>(`/api/clubs/${id}/members`),
  updateMembership: (clubId: string, userId: string, status: string) =>
    request<Membership>(`/api/clubs/${clubId}/members/${userId}`, { method: "PUT", body: JSON.stringify({ status }) }),

  // Sports
  getTeams: (params?: { sport?: string; search?: string }) => {
    const query = new URLSearchParams(cleanParams(params)).toString()
    return request<Team[]>(`/api/sports${query ? `?${query}` : ""}`)
  },
  getTeam: (id: string) => request<Team>(`/api/sports/${id}`),
  createFixture: (teamId: string, data: Partial<Fixture>) =>
    request<Fixture>(`/api/sports/${teamId}/fixtures`, { method: "POST", body: JSON.stringify(data) }),
  updateFixture: (teamId: string, fixtureId: string, data: Partial<Fixture>) =>
    request<Fixture>(`/api/sports/${teamId}/fixtures/${fixtureId}`, { method: "PUT", body: JSON.stringify(data) }),

  // Events
  getEvents: (params?: { search?: string; free?: boolean }) => {
    const query = new URLSearchParams(cleanParams(params)).toString()
    return request<Event[]>(`/api/events${query ? `?${query}` : ""}`)
  },
  getEvent: (id: string) => request<Event>(`/api/events/${id}`),
  createEvent: (data: Partial<Event>) => request<Event>("/api/events", { method: "POST", body: JSON.stringify(data) }),
  purchaseTicket: (eventId: string) =>
    request<unknown>(`/api/events/${eventId}/tickets`, { method: "POST" }),
  getMyTickets: () => request<Ticket[]>("/api/events/tickets/mine"),
  // Articles
  getArticles: (params?: { search?: string; category?: string }) => {
    const query = new URLSearchParams(cleanParams(params)).toString()
    return request<Article[]>(`/api/articles${query ? `?${query}` : ""}`)
  },
  getArticle: (id: string) => request<Article>(`/api/articles/${id}`),
  createArticle: (data: Partial<Article>) =>
    request<Article>("/api/articles", { method: "POST", body: JSON.stringify(data) }),

  // Admin
  getAdminAnalytics: () => request<Analytics>("/api/admin/analytics"),
  getAdminUsers: (params?: { role?: string; search?: string }) => {
    const query = new URLSearchParams(cleanParams(params)).toString()
    return request<User[]>(`/api/admin/users${query ? `?${query}` : ""}`)
  },
  updateUser: (id: string, data: Partial<User>) =>
    request<User>(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  assignLeader: (id: string, data: { groupType: "CLUB" | "TEAM" | "NONE"; groupId?: string }) =>
    request<User>(`/api/admin/users/${id}/leader`, { method: "PUT", body: JSON.stringify(data) }),
  getPendingClubs: () => request<Club[]>("/api/admin/approvals/clubs"),
  approveClub: (id: string, status: string) =>
    request<Club>(`/api/admin/approvals/clubs/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  getPendingEvents: () => request<Event[]>("/api/admin/approvals/events"),
  approveEvent: (id: string, status: string) =>
    request<Event>(`/api/admin/approvals/events/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  getAuditLogs: () => request<AuditLog[]>("/api/admin/audit-logs"),

  // Users
  getProfile: () => request<Profile>("/api/users/profile"),
}