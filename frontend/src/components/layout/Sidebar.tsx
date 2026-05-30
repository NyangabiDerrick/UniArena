"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Trophy,
  Calendar,
  Newspaper,
  Image,
  Bell,
  MessageSquare,
  Settings,
  Shield
} from "lucide-react"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["STUDENT", "CLUB_LEADER", "SPORTS_CAPTAIN", "LECTURER", "MODERATOR", "ADMIN"]
  },
  {
    label: "Clubs",
    href: "/clubs",
    icon: Users,
    roles: ["STUDENT", "CLUB_LEADER", "LECTURER", "MODERATOR", "ADMIN"]
  },
  {
    label: "Sports",
    href: "/sports",
    icon: Trophy,
    roles: ["STUDENT", "SPORTS_CAPTAIN", "LECTURER", "MODERATOR", "ADMIN"]
  },
  {
    label: "Events",
    href: "/events",
    icon: Calendar,
    roles: ["STUDENT", "CLUB_LEADER", "SPORTS_CAPTAIN", "LECTURER", "MODERATOR", "ADMIN"]
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
    roles: ["STUDENT", "CLUB_LEADER", "SPORTS_CAPTAIN", "LECTURER", "MODERATOR", "ADMIN"]
  },
  {
    label: "Gallery",
    href: "/gallery",
    icon: Image,
    roles: ["STUDENT", "CLUB_LEADER", "SPORTS_CAPTAIN", "LECTURER", "MODERATOR", "ADMIN"]
  },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    roles: ["STUDENT", "CLUB_LEADER", "SPORTS_CAPTAIN", "LECTURER", "MODERATOR", "ADMIN"]
  },
  {
    label: "Admin",
    href: "/admin",
    icon: Shield,
    roles: ["ADMIN", "MODERATOR"]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role || "STUDENT"

  const visibleItems = navItems.filter(item =>
    item.roles.includes(userRole)
  )

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🏟️</span>
          <span className="text-xl font-bold text-blue-600">UniArena</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.role}
            </p>
          </div>
        </div>
      </div>

    </aside>
  )
}