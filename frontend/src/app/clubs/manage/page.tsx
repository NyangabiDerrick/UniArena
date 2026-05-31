"use client"

import { useState, useEffect } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Plus,
  Settings
} from "lucide-react"

const pendingRequests = [
  { id: "1", name: "Alice Johnson", studentId: "UA-2024-010", faculty: "Law", requestedAt: "May 30, 2026" },
  { id: "2", name: "Bob Williams", studentId: "UA-2024-011", faculty: "Medicine", requestedAt: "May 29, 2026" },
  { id: "3", name: "Carol Smith", studentId: "UA-2024-012", faculty: "Engineering", requestedAt: "May 28, 2026" }
]

const members = [
  { id: "1", name: "Jane Leader", role: "President", joinedAt: "Jan 2026" },
  { id: "2", name: "Tom Brown", role: "Member", joinedAt: "Jan 2026" },
  { id: "3", name: "Lisa Chen", role: "Treasurer", joinedAt: "Feb 2026" },
  { id: "4", name: "Mark Davis", role: "Member", joinedAt: "Feb 2026" },
  { id: "5", name: "Sarah White", role: "Secretary", joinedAt: "Mar 2026" }
]

export default function ManageClubPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState(pendingRequests)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role
      if (role !== "CLUB_LEADER" && role !== "ADMIN") {
        router.push("/dashboard")
      }
    }
  }, [status, session, router])

  const handleApprove = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const handleReject = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Photography Society
            </h1>
            <p className="text-gray-500 mt-1">Club management dashboard</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/clubs/manage/create-event"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
            <Link
              href="/clubs/manage/edit"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              <Settings className="w-4 h-4" />
              Edit Club
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">124</p>
                <p className="text-sm text-gray-500">Total Members</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-500">Upcoming Events</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                <p className="text-sm text-gray-500">Pending Requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-4 w-fit">
          {["overview", "members", "requests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition capitalize ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
              {tab === "requests" && requests.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  href="/clubs/manage/create-event"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">Create new event</span>
                </Link>
                <Link
                  href="/clubs/manage/post-news"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">Post news article</span>
                </Link>
                <button
                  onClick={() => setActiveTab("requests")}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <Users className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">
                    Review {requests.length} membership requests
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Recent Members</h2>
              <div className="space-y-2">
                {members.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role} — {member.joinedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{member.role}</td>
                    <td className="px-4 py-3 text-gray-500">{member.joinedAt}</td>
                    <td className="px-4 py-3">
                      <button className="text-xs text-red-600 hover:underline">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  All membership requests have been reviewed
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {request.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.name}</p>
                        <p className="text-xs text-gray-500">
                          {request.studentId} — {request.faculty} — {request.requestedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </MainLayout>
  )
}