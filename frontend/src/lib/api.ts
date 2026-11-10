import { getSession } from "next-auth/react"
import type { Analytics, Article, AuditLog, Club, Dashboard, Event, Fixture, Membership, MemberWithUser, Profile, Team, Ticket, User } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface LeaveReason {
  value: string
  label: string
}

export interface GroupInsights {
  windowDays: number
  activeMembers: number
  joinedInWindow: number
  leftInWindow: number
  monthly: Record<string, { joined: number }>
  reasons: { reason: string; count: number }[]
}

export interface ProfileUpdate {
  faculty?: string | null
  yearOfStudy?: number | null
  bio?: string | null
}

export interface MyClubUpdate {
  name: string
  description: string
  category: string
  type: "CLUB" | "SOCIETY"
}

export interface DiscussionPost {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  userId: string
  user: { name: string }
}

export interface DiscussionList {
  canModerate: boolean
  posts: DiscussionPost[]
}

export interface PolicyStatus {
  accepted: boolean
  policyVersion: string
  termsVersion: string
}

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
  updateMyClub: (data: MyClubUpdate) =>
    request<Club>("/api/clubs/mine", { method: "PUT", body: JSON.stringify(data) }),
  getMembershipStatus: (id: string) => request<{ status: string | null }>(`/api/clubs/${id}/membership`),
  getDashboard: () => request<Dashboard>("/api/users/dashboard"),
  createClub: (data: Partial<Club>) => request<Club>("/api/clubs", { method: "POST", body: JSON.stringify(data) }),
  joinClub: (id: string) => request<Membership>(`/api/clubs/${id}/join`, { method: "POST" }),
  leaveGroup: (id: string, reason?: string) =>
    request<null>(`/api/clubs/${id}/leave`, { method: "POST", body: JSON.stringify({ reason }) }),
  getGroupInsights: (id: string) => request<GroupInsights>(`/api/clubs/${id}/insights`),
  getClubMembers: (id: string) => request<MemberWithUser[]>(`/api/clubs/${id}/members`),
  updateMembership: (clubId: string, userId: string, status: string) =>
    request<Membership>(`/api/clubs/${clubId}/members/${userId}`, { method: "PUT", body: JSON.stringify({ status }) }),

  // Discussions
  getDiscussions: (clubId: string) => request<DiscussionList>(`/api/clubs/${clubId}/discussions`),
  createDiscussion: (clubId: string, data: { title: string; content: string }) =>
    request<DiscussionPost>(`/api/clubs/${clubId}/discussions`, { method: "POST", body: JSON.stringify(data) }),
  togglePinDiscussion: (clubId: string, postId: string) =>
    request<null>(`/api/clubs/${clubId}/discussions/${postId}/pin`, { method: "PUT" }),
  deleteDiscussion: (clubId: string, postId: string) =>
    request<null>(`/api/clubs/${clubId}/discussions/${postId}`, { method: "DELETE" }),

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

  // Users and policy
  getProfile: () => request<Profile & { bio?: string | null }>("/api/users/profile"),
  updateProfile: (data: ProfileUpdate) =>
    request<Profile & { bio?: string | null }>("/api/users/profile", { method: "PUT", body: JSON.stringify(data) }),
  getLeaveReasons: () => request<LeaveReason[]>("/api/users/leave-reasons"),
  getPolicyStatus: () => request<PolicyStatus>("/api/auth/policy-status"),
  acceptPolicy: () => request<null>("/api/auth/accept-policy", { method: "POST" }),
}