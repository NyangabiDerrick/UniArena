"use client"

import { useSession } from "next-auth/react"
import {
  Users,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"

const stats = [
  {
    label: "Total Users",
    value: "842",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
    change: "+12 this week"
  },
  {
    label: "Active Clubs",
    value: "34",
    icon: Building2,
    color: "bg-green-50 text-green-600",
    change: "+2 this month"
  },
  {
    label: "Upcoming Events",
    value: "18",
    icon: Calendar,
    color: "bg-orange-50 text-orange-600",
    change: "Next 30 days"
  },
  {
    label: "Pending Approvals",
    value: "7",
    icon: AlertCircle,
    color: "bg-red-50 text-red-600",
    change: "Needs attention"
  }
]

const recentActivity = [
  {
    action: "Club request submitted",
    detail: "Photography Society by John Student",
    time: "2 minutes ago",
    type: "pending"
  },
  {
    action: "Event approved",
    detail: "Annual Sports Day by Sarah Admin",
    time: "1 hour ago",
    type: "approved"
  },
  {
    action: "User suspended",
    detail: "Account violation — user@university.ac",
    time: "3 hours ago",
    type: "rejected"
  },
  {
    action: "Club approved",
    detail: "Debate Society now active",
    time: "Yesterday",
    type: "approved"
  },
  {
    action: "New user registered",
    detail: "newstudent@university.ac joined",
    time: "Yesterday",
    type: "pending"
  }
]

function StatusIcon({ type }: { type: string }) {
  if (type === "approved") return <CheckCircle className="w-4 h-4 text-green-500" />
  if (type === "rejected") return <XCircle className="w-4 h-4 text-red-500" />
  return <Clock className="w-4 h-4 text-orange-500" />
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function AdminPage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Platform overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                stat.color
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <StatusIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {item.action}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/admin/users"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">View, suspend, change roles</p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-gray-600">›</span>
            </a>

            <a
              href="/admin/approvals"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Approval Queue</p>
                  <p className="text-xs text-gray-500">7 items pending review</p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-gray-600">›</span>
            </a>

            <a
              href="/admin/audit"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Audit Logs</p>
                  <p className="text-xs text-gray-500">View all admin actions</p>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-gray-600">›</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}