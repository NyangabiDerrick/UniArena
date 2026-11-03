import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface ManagedEvent {
  id: string
  title: string
  venue: string
  startsAt: string
  endsAt: string
  capacity: number
  isFree: boolean
  status: string
  moderationNote: string | null
  suspendedByAdmin: boolean
  club: { name: string } | null
  team: { name: string } | null
  _count: { tickets: number }
}

export type EventAction = "cancel" | "suspend" | "restore"

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
    const detail = Array.isArray(json.errors) ? json.errors.map((e: { msg: string }) => e.msg).join(", ") : ""
    throw new Error(json.message === "Validation error" && detail ? detail : json.message || "Request failed")
  }
  return { data: json.data as T, message: json.message as string }
}

export const getManagedEvents = async () => (await call<ManagedEvent[]>("/api/events/managed")).data
export const changeEvent = async (id: string, action: EventAction, reason?: string) =>
  (await call<null>(`/api/events/${id}/${action}`, "PUT", reason ? { reason } : {})).message