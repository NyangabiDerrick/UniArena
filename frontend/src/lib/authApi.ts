const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

async function post(path: string, body: unknown): Promise<string> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
  } catch {
    throw new Error("Cannot reach the server. Please try again.")
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = Array.isArray(data.errors)
      ? data.errors.map((e: any) => `${e.path}: ${e.msg}`).join(", ")
      : ""
    throw new Error(data.message === "Validation error" && detail ? detail : data.message || "Something went wrong")
  }
  return data.message
}

export const registerAccount = (b: { name: string; email: string; studentId: string; password: string; faculty?: string }) =>
  post("/api/auth/register", b)
export const requestPasswordReset = (email: string) => post("/api/auth/forgot-password", { email })
export const resetPassword = (token: string, password: string) => post("/api/auth/reset-password", { token, password })