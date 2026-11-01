import { getSession } from "next-auth/react"
import type { Ticket } from "./ticketTypes"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function getMyTickets(): Promise<Ticket[]> {
  const session = await getSession()

  const res = await fetch(`${API_URL}/api/events/tickets/mine`, {
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    }
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || "Failed to load tickets")
  return body.data as Ticket[]
}