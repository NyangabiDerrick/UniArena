"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Eye } from "lucide-react"

const pendingClubs = [
  {
    id: "1",
    name: "Photography Society",
    category: "Arts",
    submittedBy: "John Student",
    submittedAt: "May 30, 2026",
    description: "A club for photography enthusiasts on campus"
  },
  {
    id: "2",
    name: "Chess Club",
    category: "Academic",
    submittedBy: "Jane Leader",
    submittedAt: "May 29, 2026",
    description: "Competitive and recreational chess for all skill levels"
  },
  {
    id: "3",
    name: "Coding Bootcamp",
    category: "Academic",
    submittedBy: "Mike Captain",
    submittedAt: "May 28, 2026",
    description: "Weekly coding sessions and hackathons"
  }
]

export default function ApprovalsPage() {
  const [clubs, setClubs] = useState(pendingClubs)
  const [activeTab, setActiveTab] = useState("clubs")

  const handleApprove = (id: string) => {
    setClubs(prev => prev.filter(c => c.id !== id))
    alert("Club approved successfully")
  }

  const handleReject = (id: string) => {
    setClubs(prev => prev.filter(c => c.id !== id))
    alert("Club rejected")
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
        <p className="text-gray-500 mt-1">
          Review and approve pending club requests and content
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
        {["clubs", "events", "articles", "media"].map((tab) => (
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
            {tab === "clubs" && clubs.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {clubs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Club Approvals */}
      {activeTab === "clubs" && (
        <div className="space-y-4">
          {clubs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                All club requests have been reviewed
              </p>
            </div>
          ) : (
            clubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{club.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {club.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{club.description}</p>
                    <p className="text-xs text-gray-400">
                      Submitted by {club.submittedBy} on {club.submittedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleApprove(club.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(club.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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

      {/* Other tabs placeholder */}
      {activeTab !== "clubs" && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-gray-500 text-sm capitalize">
            No pending {activeTab} to review
          </p>
        </div>
      )}

    </div>
  )
}