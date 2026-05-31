"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { MessageSquare, Pin, Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"

const mockPosts = [
  {
    id: "1",
    title: "Welcome to the Photography Society discussion board!",
    content: "This is a space for members to discuss photography tips, share ideas, and organise activities. Please keep discussions respectful and on-topic.",
    author: "Jane Leader",
    role: "President",
    isPinned: true,
    replies: 5,
    date: "Jan 15, 2026"
  },
  {
    id: "2",
    title: "Best camera settings for night photography?",
    content: "I have been struggling with night shots lately. Anyone have tips on the best settings for low light photography on a budget camera?",
    author: "Tom Brown",
    role: "Member",
    isPinned: false,
    replies: 12,
    date: "May 20, 2026"
  },
  {
    id: "3",
    title: "Photo walk this Saturday — who is joining?",
    content: "We are organising a photo walk around the old town this Saturday at 10am. Meeting at the main gate. All skill levels welcome!",
    author: "Lisa Chen",
    role: "Treasurer",
    isPinned: false,
    replies: 8,
    date: "May 25, 2026"
  },
  {
    id: "4",
    title: "Exhibition volunteer signup",
    content: "We need 10 volunteers to help set up the annual exhibition on June 9th. Duties include hanging photos, greeting guests and helping with logistics.",
    author: "Jane Leader",
    role: "President",
    isPinned: false,
    replies: 3,
    date: "May 28, 2026"
  }
]

export default function DiscussionPage() {
  const [posts, setPosts] = useState(mockPosts)

  const pinned = posts.filter(p => p.isPinned)
  const regular = posts.filter(p => !p.isPinned)

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          href="/clubs/1"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Club
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discussion Board</h1>
            <p className="text-gray-500 mt-1">Photography Society — Members only</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>

        {/* Pinned Posts */}
        {pinned.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-700">Pinned</h2>
            </div>
            {pinned.map((post) => (
              <div
                key={post.id}
                className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3 cursor-pointer hover:bg-blue-100 transition"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-600">{post.author}</span>
                    <span>{post.role}</span>
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {post.replies} replies
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Regular Posts */}
        <div className="space-y-3">
          {regular.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-100 transition"
            >
              <h3 className="font-semibold text-gray-900 mb-1">{post.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-xs">
                    {post.author.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-600">{post.author}</span>
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {post.replies} replies
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </MainLayout>
  )
}