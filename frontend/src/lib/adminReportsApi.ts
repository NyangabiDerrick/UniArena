import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface ReportPerson {
  id: string
  name: string
  studentId: string
  role: string
  isActive: boolean
}

export interface EvidenceLine {
  from: "reporter" | "reported"
  content: string
  sentAt: string
}

export interface Report {
  id: string
  reason: string
  details: string | null
  status: "OPEN" | "RESOLVED" | "DISMISSED"
  resolution: string | null
  createdAt: string
  reporter: ReportPerson
  reported: ReportPerson
  evidence: EvidenceLine[]
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

export const getReports = (status: string) => call<Report[]>(`/api/admin/reports?status=${status}`)
export const decideReport = (id: string, action: "DISMISS" | "RESOLVE" | "SUSPEND", note?: string) =>
  call<null>(`/api/admin/reports/${id}`, "PUT", { action, note: note || undefined })