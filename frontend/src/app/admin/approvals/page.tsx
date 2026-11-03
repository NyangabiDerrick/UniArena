"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Club requests are approved on the Campus Groups page, so this page just forwards there.
export default function ApprovalsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/groups")
  }, [router])

  return <p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Opening Campus Groups...</p>
}