"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">🏟️ UniArena</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome back, {session.user.name} 👋
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-medium">{session.user.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Role:</span>
              <p className="font-medium">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {session.user.role}
                </span>
              </p>
            </div>
            <div>
              <span className="text-gray-500">Student ID:</span>
              <p className="font-medium">{session.user.studentId}</p>
            </div>
            <div>
              <span className="text-gray-500">Faculty:</span>
              <p className="font-medium">{session.user.faculty}</p>
            </div>
          </div>
        </div>

        {/* Role Based Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
          ✅ Authentication working — you are logged in as{" "}
          <strong>{session.user.role}</strong>
        </div>

      </div>
    </div>
  )
}