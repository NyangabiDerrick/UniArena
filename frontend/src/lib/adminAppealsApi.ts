import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface AppealItem {
  id: string
  message: string
  status: "OPEN" | "APPROVED" | "REJECTED"
  decision: string | null
  createdAt: string
  decidedAt: string | null
  user: {
    id: string
    name: string
    studentId: string
    email: string
    isActive: boolean
    warnings: { message: string; createdAt: string }[]
    reportsAgainst: { reason: string; resolution: string | null; resolvedAt: string | null }[]
  }
}

async function call<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const session = await getSession()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Request failed")
  return data.data as T
}

export const getAppeals = (status: string) => call<AppealItem[]>(`/api/admin/appeals?status=${status}`)
export const decideAppeal = (id: string, action: "APPROVE" | "REJECT", note?: string) =>
  call<null>(`/api/admin/appeals/${id}`, "PUT", { action, note: note || undefined })