"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"

const mockUsers = [
  {
    id: "1",
    name: "John Student",
    email: "student@university.ac",
    role: "STUDENT",
    faculty: "Computer Science",
    studentId: "UA-2024-001",
    isActive: true,
    joinedAt: "Jan 2026"
  },
  {
    id: "2",
    name: "Jane Leader",
    email: "leader@university.ac",
    role: "CLUB_LEADER",
    faculty: "Business",
    studentId: "UA-2024-002",
    isActive: true,
    joinedAt: "Jan 2026"
  },
  {
    id: "3",
    name: "Mike Captain",
    email: "captain@university.ac",
    role: "SPORTS_CAPTAIN",
    faculty: "Sports Science",
    studentId: "UA-2024-003",
    isActive: true,
    joinedAt: "Jan 2026"
  },
  {
    id: "4",
    name: "Sarah Admin",
    email: "admin@university.ac",
    role: "ADMIN",
    faculty: "Administration",
    studentId: "UA-2024-004",
    isActive: true,
    joinedAt: "Jan 2026"
  },
  {
    id: "5",
    name: "Dr. Smith",
    email: "lecturer@university.ac",
    role: "LECTURER",
    faculty: "Computer Science",
    studentId: "UA-STAFF-001",
    isActive: true,
    joinedAt: "Jan 2026"
  }
]

const roleBadgeColor: Record<string, string> = {
  STUDENT: "bg-gray-100 text-gray-700",
  CLUB_LEADER: "bg-blue-100 text-blue-700",
  SPORTS_CAPTAIN: "bg-green-100 text-green-700",
  LECTURER: "bg-purple-100 text-purple-700",
  MODERATOR: "bg-orange-100 text-orange-700",
  ADMIN: "bg-red-100 text-red-700"
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")

  const filtered = mockUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">
          Manage all platform users, roles and access
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="CLUB_LEADER">Club Leader</option>
              <option value="SPORTS_CAPTAIN">Sports Captain</option>
              <option value="LECTURER">Lecturer</option>
              <option value="MODERATOR">Moderator</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Faculty</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.studentId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleBadgeColor[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{user.faculty}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {user.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button className="text-xs text-red-600 hover:underline">
                      Suspend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No users found matching your search.
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {filtered.length} of {mockUsers.length} users
          </p>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button className="text-xs px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}