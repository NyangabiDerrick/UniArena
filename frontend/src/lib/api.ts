const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message: string }> {

  // Get token from NextAuth session cookie
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return res.json()
}

export const api = {
  // Clubs
  getClubs: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return request<any[]>(`/api/clubs${query ? `?${query}` : ''}`)
  },
  getClub: (id: string) => request<any>(`/api/clubs/${id}`),
  createClub: (data: any) => request<any>('/api/clubs', { method: 'POST', body: JSON.stringify(data) }),
  joinClub: (id: string) => request<any>(`/api/clubs/${id}/join`, { method: 'POST' }),
  getClubMembers: (id: string) => request<any[]>(`/api/clubs/${id}/members`),
  updateMembership: (clubId: string, userId: string, status: string) =>
    request<any>(`/api/clubs/${clubId}/members/${userId}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Sports
  getTeams: (params?: { sport?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return request<any[]>(`/api/sports${query ? `?${query}` : ''}`)
  },
  getTeam: (id: string) => request<any>(`/api/sports/${id}`),
  createFixture: (teamId: string, data: any) =>
    request<any>(`/api/sports/${teamId}/fixtures`, { method: 'POST', body: JSON.stringify(data) }),
  updateFixture: (teamId: string, fixtureId: string, data: any) =>
    request<any>(`/api/sports/${teamId}/fixtures/${fixtureId}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Events
  getEvents: (params?: { search?: string; free?: boolean }) => {
    const query = new URLSearchParams(params as any).toString()
    return request<any[]>(`/api/events${query ? `?${query}` : ''}`)
  },
  getEvent: (id: string) => request<any>(`/api/events/${id}`),
  createEvent: (data: any) => request<any>('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  purchaseTicket: (eventId: string) =>
    request<any>(`/api/events/${eventId}/tickets`, { method: 'POST' }),

  // Articles
  getArticles: (params?: { search?: string; category?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return request<any[]>(`/api/articles${query ? `?${query}` : ''}`)
  },
  getArticle: (id: string) => request<any>(`/api/articles/${id}`),
  createArticle: (data: any) =>
    request<any>('/api/articles', { method: 'POST', body: JSON.stringify(data) }),

  // Admin
  getAdminAnalytics: () => request<any>('/api/admin/analytics'),
  getAdminUsers: (params?: { role?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString()
    return request<any[]>(`/api/admin/users${query ? `?${query}` : ''}`)
  },
  updateUser: (id: string, data: any) =>
    request<any>(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getPendingClubs: () => request<any[]>('/api/admin/approvals/clubs'),
  approveClub: (id: string, status: string) =>
    request<any>(`/api/admin/approvals/clubs/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getPendingEvents: () => request<any[]>('/api/admin/approvals/events'),
  approveEvent: (id: string, status: string) =>
    request<any>(`/api/admin/approvals/events/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAuditLogs: () => request<any[]>('/api/admin/audit-logs'),

  // Users
  syncUser: (data: any) => request<any>('/api/users/sync', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request<any>('/api/users/profile'),
}