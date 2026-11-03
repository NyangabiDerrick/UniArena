import { getSession } from "next-auth/react"
import type { ReportReasonValue } from "@/components/layout/ReportDialog"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

async function send(path: string, reason: ReportReasonValue, details: string): Promise<string> {
  const session = await getSession()
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    },
    body: JSON.stringify({ reason, details: details || undefined })
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Could not send the report")
  return json.message as string
}

export const reportEvent = (id: string, reason: ReportReasonValue, details: string) =>
  send(`/api/events/${id}/report`, reason, details)

export const reportArticle = (id: string, reason: ReportReasonValue, details: string) =>
  send(`/api/articles/${id}/report`, reason, details)