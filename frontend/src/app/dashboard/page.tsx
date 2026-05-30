"use client"

import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import {
  Users,
  Calendar,
  Trophy,
  Newspaper
} from "lucide-react"

const stats = [
  { label: "My Clubs", value: "3", icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Upcoming Events", value: "5", icon: Calendar, color: "bg-green-50 text-green-600" },
  { label: "Sports Teams", value: "2", icon: Trophy, color: "bg-orange-50 text-orange-600" },
  { label: "Latest News", value: "12", icon: Newspaper, color: "bg-purple-50 text-purple-600" }
]

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here is what is happening at UniArena today
          </p>
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <span className="bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
            {session?.user?.role}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            {session?.user?.faculty}
          </span>
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
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">My Clubs</h2>
            <p className="text-sm text-gray-500">
              You have not joined any clubs yet.
            </p>
            <a
              href="/clubs"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Browse clubs
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Upcoming Events</h2>
            <p className="text-sm text-gray-500">
              No upcoming events yet.
            </p>
            <a
              href="/events"
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              View events
            </a>
          </div>
        </div>

      </div>
    </MainLayout>
  )
}