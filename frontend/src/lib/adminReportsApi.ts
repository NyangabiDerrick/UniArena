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
  context?: string
}

export type ReportTargetType = "MESSAGE" | "COMMENT" | "EVENT" | "ARTICLE"

export interface Report {
  id: string
  reason: string
  details: string | null
  status: "OPEN" | "RESOLVED" | "DISMISSED"
  resolution: string | null
  createdAt: string
  targetType: ReportTargetType
  warningCount: number
  reporter: ReportPerson
  reported: ReportPerson
  evidence: EvidenceLine[]
}

export type ReportAction = "DISMISS" | "RESOLVE" | "WARN" | "SUSPEND"

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
  if (!res.ok) {
    const detail = Array.isArray(data.errors) ? data.errors.map((e: { msg: string }) => e.msg).join(", ") : ""
    throw new Error(data.message === "Validation error" && detail ? detail : data.message || "Request failed")
  }
  return data.data as T
}

export const getReports = (status: string) => call<Report[]>(`/api/admin/reports?status=${status}`)
export const decideReport = (id: string, action: ReportAction, note?: string, removeContent?: boolean) =>
  call<null>(`/api/admin/reports/${id}`, "PUT", {
    action,
    note: note || undefined,
    removeContent: removeContent || undefined
  })