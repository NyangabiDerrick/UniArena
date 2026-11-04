import { getSession } from "next-auth/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

async function post(path: string, body: unknown, signedIn: boolean): Promise<string> {
  const session = signedIn ? await getSession() : null
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    },
    body: JSON.stringify(body)
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Something went wrong")
  return json.message as string
}

export const verifyEmail = (token: string) => post("/api/auth/verify-email", { token }, false)
export const resendVerification = () => post("/api/auth/resend-verification", {}, true)