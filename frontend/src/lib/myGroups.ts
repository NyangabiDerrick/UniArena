"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { api } from "./api"

// True when the page was opened from the dashboard with ?mine=1, so it starts on "my groups".
// Pages that use this must be rendered inside a <Suspense> boundary.
export const useMineFromUrl = () => useSearchParams().get("mine") === "1"

export interface MyGroups {
  clubIds: Set<string>
  teamIds: Set<string>
  ready: boolean
}

// The clubs and teams the signed-in person belongs to, from the dashboard
export function useMyGroups(): MyGroups {
  const { status } = useSession()
  const [state, setState] = useState<MyGroups>({ clubIds: new Set(), teamIds: new Set(), ready: false })

  useEffect(() => {
    if (status !== "authenticated") return
    let cancelled = false
    api.getDashboard()
      .then(res => {
        if (cancelled) return
        setState({
          clubIds: new Set(res.data.clubs.map(c => c.id)),
          teamIds: new Set(res.data.teams.map(t => t.id)),
          ready: true
        })
      })
      .catch(() => {
        if (!cancelled) setState({ clubIds: new Set(), teamIds: new Set(), ready: true })
      })
    return () => { cancelled = true }
  }, [status])

  return state
}