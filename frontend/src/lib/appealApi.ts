const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function submitAppeal(email: string, password: string, message: string): Promise<string> {
  let res: Response
  try {
    res = await fetch(`${API_URL}/api/appeals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password, message: message.trim() })
    })
  } catch {
    throw new Error("Cannot reach the server. Please try again.")
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = Array.isArray(data.errors)
      ? data.errors.map((e: { msg: string }) => e.msg).join(", ")
      : ""
    throw new Error(data.message === "Validation error" && detail ? detail : data.message || "Something went wrong")
  }
  return data.message as string
}