"use client"

import { Clock } from "lucide-react"

const mockLogs = [
  {
    id: "1",
    action: "Approved club request",
    target: "Photography Society",
    admin: "Sarah Admin",
    time: "May 30, 2026 — 14:32"
  },
  {
    id: "2",
    action: "Suspended user account",
    target: "user@university.ac",
    admin: "Sarah Admin",
    time: "May 30, 2026 — 11:15"
  },
  {
    id: "3",
    action: "Rejected event",
    target: "Off-campus Party",
    admin: "Sarah Admin",
    time: "May 29, 2026 — 16:45"
  },
  {
    id: "4",
    action: "Changed user role",
    target: "Jane Leader — STUDENT to CLUB_LEADER",
    admin: "Sarah Admin",
    time: "May 29, 2026 — 09:20"
  },
  {
    id: "5",
    action: "Approved article",
    target: "Welcome to UniArena",
    admin: "Sarah Admin",
    time: "May 28, 2026 — 13:10"
  }
]

export default function AuditPage() {
  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">
          Full record of all admin actions on the platform
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{log.action}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.target}</td>
                <td className="px-4 py-3 text-gray-600">{log.admin}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {mockLogs.length} most recent actions
          </p>
          <button className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
            Export CSV
          </button>
        </div>
      </div>

    </div>
  )
}