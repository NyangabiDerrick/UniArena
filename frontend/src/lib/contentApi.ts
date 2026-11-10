import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type EventCategory = "SOCIAL" | "CLUB" | "SPORTS" | "UNIVERSITY" | "ACADEMIC"
export type ArticleCategory = "CLUB" | "SPORTS" | "UNIVERSITY"

export const CATEGORY_LABELS: Record<string, string> = {
  SOCIAL: "Social",
  CLUB: "Club",
  SPORTS: "Sports",
  UNIVERSITY: "University",
  ACADEMIC: "Academic"
}

export interface NewEvent {
  title: string
  category: EventCategory
  venue: string
  description: string
  startsAt: string
  endsAt: string
  capacity: number
  isFree: boolean
}

export interface NewArticle {
  title: string
  category: ArticleCategory
  content: string
  tags: string[]
}

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
    const detail = Array.isArray(json.errors)
      ? json.errors.map((e: { path?: string; msg: string }) => `${e.path ?? "field"}: ${e.msg}`).join(", ")
      : ""
    throw new Error(json.message === "Validation error" && detail ? detail : json.message || "Request failed")
  }
  return { data: json.data as T, message: json.message as string }
}

export const getEventCategories = async () => (await call<EventCategory[]>("/api/events/categories")).data
export const getArticleCategories = async () => (await call<ArticleCategory[]>("/api/articles/categories")).data
export const createEvent = async (e: NewEvent) => (await call<unknown>("/api/events", "POST", e)).message
export const createArticle = async (a: NewArticle) => (await call<unknown>("/api/articles", "POST", a)).message