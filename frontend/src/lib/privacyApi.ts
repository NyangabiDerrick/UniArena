import { getSession, clearSessionCache } from "./session"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

async function call(path: string, method: string, body?: unknown) {
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
  if (!res.ok) throw new Error(data.message || "Request failed")
  return data
}

// Downloads everything UniArena holds about the signed-in person as a JSON file
export async function downloadMyData() {
  const data = await call("/api/users/me/export", "GET")
  const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "uniarena-my-data.json"
  link.click()
  URL.revokeObjectURL(url)
}

export async function deleteMyAccount(password: string) {
  await call("/api/users/me", "DELETE", { password })
  clearSessionCache()
}
