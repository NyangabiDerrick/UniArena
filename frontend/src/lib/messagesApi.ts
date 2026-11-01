import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface Partner {
  id: string
  name: string
  subtitle: string
}

export interface Conversation {
  partner: Partner
  lastMessage: string
  lastAt: string
  unread: number
}

export interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  sentAt: string
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
  if (!res.ok) {
    const detail = Array.isArray(data.errors) ? data.errors.map((e: { msg: string }) => e.msg).join(", ") : ""
    throw new Error(data.message === "Validation error" && detail ? detail : data.message || "Request failed")
  }
  return data.data as T
}

export const getConversations = () => call<Conversation[]>("/api/messages/conversations")
export const getContacts = (search: string) =>
  call<Partner[]>(`/api/messages/contacts?search=${encodeURIComponent(search)}`)
export const getThread = (userId: string) =>
  call<{ partner: Partner; messages: ChatMessage[] }>(`/api/messages/thread/${userId}`)
export const sendMessage = (receiverId: string, content: string) =>
  call<ChatMessage>("/api/messages", "POST", { receiverId, content })
export const getUnreadMessages = () => call<{ count: number }>("/api/messages/unread-count")