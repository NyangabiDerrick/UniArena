"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import {
  Bell,
  CheckCircle,
  Calendar,
  Users,
  Newspaper,
  Trophy
} from "lucide-react"

const mockNotifications = [
  {
    id: "1",
    title: "Membership request approved",
    message: "Your request to join Photography Society has been approved.",
    type: "club",
    isRead: false,
    time: "2 minutes ago",
    icon: Users,
    iconColor: "text-blue-600 bg-blue-50"
  },
  {
    id: "2",
    title: "Event reminder",
    message: "Annual Sports Day is tomorrow at 9:00 AM at the Main Stadium.",
    type: "event",
    isRead: false,
    time: "1 hour ago",
    icon: Calendar,
    iconColor: "text-orange-600 bg-orange-50"
  },
  {
    id: "3",
    title: "New article published",
    message: "Photography Society posted: Our members won 3 awards at the National Competition.",
    type: "news",
    isRead: false,
    time: "3 hours ago",
    icon: Newspaper,
    iconColor: "text-purple-600 bg-purple-50"
  },
  {
    id: "4",
    title: "Match result posted",
    message: "UniArena FC won 3-1 against City University in the National Championship Final.",
    type: "sports",
    isRead: true,
    time: "Yesterday",
    icon: Trophy,
    iconColor: "text-green-600 bg-green-50"
  },
  {
    id: "5",
    title: "Ticket confirmed",
    message: "Your RSVP for Annual Sports Day has been confirmed. Check your email for the QR code.",
    type: "event",
    isRead: true,
    time: "2 days ago",
    icon: CheckCircle,
    iconColor: "text-green-600 bg-green-50"
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const markRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = notification.icon
            return (
              <div
                key={notification.id}
                onClick={() => markRead(notification.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer ${
                  notification.isRead
                    ? "bg-white border-gray-100"
                    : "bg-blue-50 border-blue-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${notification.isRead ? "text-gray-700" : "text-gray-900"}`}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}

      </div>
    </MainLayout>
  )
}