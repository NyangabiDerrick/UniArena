"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import AuthShell, { errorBox, successBox, linkStyle } from "@/components/layout/AuthShell"
import { verifyEmail } from "@/lib/verifyApi"

function Confirm() {
  const token = useSearchParams().get("token") || ""
  const [state, setState] = useState<"working" | "done" | "failed">(token ? "working" : "failed")
  const [message, setMessage] = useState(token ? "" : "This link is incomplete. Open the full link from your email.")

  useEffect(() => {
    if (!token) return
    let cancelled = false
    verifyEmail(token)
      .then(m => { if (!cancelled) { setMessage(m); setState("done") } })
      .catch(e => { if (!cancelled) { setMessage(e instanceof Error ? e.message : "Something went wrong"); setState("failed") } })
    return () => { cancelled = true }
  }, [token])

  return (
    <AuthShell
      title={state === "done" ? "Email confirmed" : state === "failed" ? "Couldn't confirm" : "Confirming..."}
      subtitle={state === "done" ? "Messaging, RSVPs and joining clubs are now unlocked." : "One moment."}
    >
      {state === "done" && <div style={successBox}>{message}</div>}
      {state === "failed" && <div style={errorBox}>{message}</div>}
      {state !== "working" && (
        <Link href="/dashboard" style={linkStyle}>Go to UniArena</Link>
      )}
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <Confirm />
    </Suspense>
  )
}