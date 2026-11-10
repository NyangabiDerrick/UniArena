import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface AppNotification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

export interface NotificationList {
  items: AppNotification[]
  unreadCount: number
}

async function call<T>(path: string, method = "GET"): Promise<T> {
  const session = await getSession()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    }
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || "Request failed")
  return body.data as T
}

export const getNotifications = () => call<NotificationList>("/api/notifications")
export const markNotificationRead = (id: string) => call<null>(`/api/notifications/${id}/read`, "PUT")
export const markAllNotificationsRead = () => call<null>("/api/notifications/read-all", "PUT")