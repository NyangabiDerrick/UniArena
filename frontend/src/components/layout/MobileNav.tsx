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
  Newspaper
} from "lucide-react"

const mobileNavItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clubs", href: "/clubs", icon: Users },
  { label: "Sports", href: "/sports", icon: Trophy },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "News", href: "/news", icon: Newspaper }
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex md:hidden z-30">
      {mobileNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-3 text-xs gap-1 transition-colors",
              isActive
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-900"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}