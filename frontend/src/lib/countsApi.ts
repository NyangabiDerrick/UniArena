import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface Counts {
  notifications: number
  messages: number
}

export async function getCounts(): Promise<Counts> {
  const session = await getSession()
  const res = await fetch(`${API_URL}/api/counts`, {
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    }
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || "Request failed")
  return body.data as Counts
}