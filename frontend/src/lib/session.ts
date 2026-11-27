import { getSession as fetchSession } from "next-auth/react"
import type { Session } from "next-auth"

// next-auth's getSession() asks the server for the session (and a fresh API token) every time it is called,
// which doubled the number of requests for every page. This keeps the answer until the token is nearly out of date.
let cached: { session: Session | null; until: number } | null = null
let inflight: Promise<Session | null> | null = null

const REFRESH_BEFORE_MS = 5 * 60 * 1000
const SIGNED_OUT_FOR_MS = 5 * 1000

const expiryOf = (token?: string): number => {
  try {
    const payload = JSON.parse(atob((token ?? "").split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0
  } catch {
    return 0
  }
}

export async function getSession(): Promise<Session | null> {
  if (cached && Date.now() < cached.until) return cached.session
  if (inflight) return inflight

  inflight = fetchSession()
    .then(session => {
      const until = session?.accessToken
        ? Math.max(Date.now(), expiryOf(session.accessToken) - REFRESH_BEFORE_MS)
        : Date.now() + SIGNED_OUT_FOR_MS
      cached = { session, until }
      return session
    })
    .finally(() => { inflight = null })

  return inflight
}

// Call after signing in or out, and when the API says the sign-in is no longer valid
export const clearSessionCache = () => { cached = null }
