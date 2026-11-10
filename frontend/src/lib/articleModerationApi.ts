import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface ManagedArticle {
  id: string
  title: string
  status: string
  category: string
  createdAt: string
  moderationNote: string | null
  removedByAdmin: boolean
  author: { name: string } | null
  club: { name: string } | null
  team: { name: string } | null
}

export type ArticleAction = "hide" | "remove" | "restore"

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

export const getManagedArticles = async () => (await call<ManagedArticle[]>("/api/articles/managed")).data
export const changeArticle = async (id: string, action: ArticleAction, reason?: string) =>
  (await call<null>(`/api/articles/${id}/${action}`, "PUT", reason ? { reason } : {})).message