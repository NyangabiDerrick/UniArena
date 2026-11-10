import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface ArticleComment {
  id: string
  content: string
  createdAt: string
  userId: string
  user: { name: string }
}

export interface ArticleDetail {
  id: string
  title: string
  content: string
  createdAt: string
  tags: string[]
  isUniversityWide: boolean
  author: { name: string } | null
  club: { name: string } | null
  comments: ArticleComment[]
}

export type CommentReportReason = "SPAM" | "HARASSMENT" | "INAPPROPRIATE" | "OTHER"

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

export const getArticleWithComments = (id: string) => call<ArticleDetail>(`/api/articles/${id}`)
export const postComment = (articleId: string, content: string) =>
  call<ArticleComment>(`/api/articles/${articleId}/comments`, "POST", { content })
export const reportComment = (commentId: string, reason: CommentReportReason, details?: string) =>
  call<null>(`/api/comments/${commentId}/report`, "POST", { reason, details: details || undefined })