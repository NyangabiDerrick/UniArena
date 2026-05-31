"use client"

import { signOut, useSession } from "next-auth/react"
import { Bell, LogOut, User } from "lucide-react"
import Link from "next/link"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20">
      
      {/* Left — Page context */}
      <div>
        <p className="text-sm text-gray-500">
          Welcome back,{" "}
          <span className="font-medium text-gray-900">
            {session?.user?.name}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Link>

        {/* Profile */}
        <Link
          href="/profile"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          <User className="w-5 h-5" />
        </Link>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </header>
  )
}