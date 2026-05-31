"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Pin } from "lucide-react"
import Link from "next/link"

const filters = ["All", "Clubs", "Sports", "University"]

const mockArticles = [
  {
    id: "1",
    title: "UniArena FC wins the National University Football Championship",
    excerpt: "After a thrilling final against City University, our football team clinched the national title with a 3-1 victory in front of 2,000 fans.",
    author: "Sports Reporter",
    club: "UniArena FC",
    category: "Sports",
    date: "May 28, 2026",
    isPinned: true,
    readTime: "3 min read"
  },
  {
    id: "2",
    title: "Photography Society wins Best University Club award",
    excerpt: "The Photography Society has been named the Best University Club at the National Student Union Awards for the second year running.",
    author: "Jane Leader",
    club: "Photography Society",
    category: "Clubs",
    date: "May 25, 2026",
    isPinned: true,
    readTime: "2 min read"
  },
  {
    id: "3",
    title: "University announces new student activity centre opening in September",
    excerpt: "The long-awaited student activity centre will open its doors in September 2026 featuring new sports facilities, a performance space, and club offices.",
    author: "University Communications",
    club: "University",
    category: "University",
    date: "May 22, 2026",
    isPinned: false,
    readTime: "4 min read"
  },
  {
    id: "4",
    title: "Debate Society prepares for national championship",
    excerpt: "After winning the regional qualifiers, the Debate Society is now preparing to represent the university at the national championship next month.",
    author: "Debate Society",
    club: "Debate Society",
    category: "Clubs",
    date: "May 20, 2026",
    isPinned: false,
    readTime: "2 min read"
  },
  {
    id: "5",
    title: "Swimming team breaks three university records at regional meet",
    excerpt: "The UniArena Swim Team had an outstanding performance at the regional meet, breaking three long-standing university records.",
    author: "Sports Reporter",
    club: "UniArena Swim Team",
    category: "Sports",
    date: "May 18, 2026",
    isPinned: false,
    readTime: "3 min read"
  },
  {
    id: "6",
    title: "African Culture Night ticket sales open — limited spots available",
    excerpt: "Tickets for the highly anticipated African Culture Night are now on sale. With only 300 spots available, early booking is strongly advised.",
    author: "African Culture Society",
    club: "African Culture Society",
    category: "Clubs",
    date: "May 15, 2026",
    isPinned: false,
    readTime: "1 min read"
  }
]

const categoryColors: Record<string, string> = {
  Sports: "bg-orange-50 text-orange-600",
  Clubs: "bg-blue-50 text-blue-600",
  University: "bg-purple-50 text-purple-600"
}

export default function NewsPage() {
  const [search, setSearch] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")

  const filtered = mockArticles.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      selectedFilter === "All" || article.category === selectedFilter
    return matchesSearch && matchesFilter
  })

  const pinned = filtered.filter(a => a.isPinned)
  const regular = filtered.filter(a => !a.isPinned)

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">News & Announcements</h1>
          <p className="text-gray-500 mt-1">
            Stay up to date with everything happening at UniArena
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search news and announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 text-sm rounded-full border transition ${
                selectedFilter === filter
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Pinned Articles */}
        {pinned.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-700">Pinned</h2>
            </div>
            <div className="space-y-3">
              {pinned.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="block bg-blue-50 border border-blue-100 rounded-xl p-5 hover:bg-blue-100 transition group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[article.category]}`}>
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{article.club}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{article.author}</span>
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        <div className="space-y-3">
          {regular.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.id}`}
              className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-blue-100 transition group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[article.category]}`}>
                  {article.category}
                </span>
                <span className="text-xs text-gray-500">{article.club}</span>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.excerpt}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{article.author}</span>
                <span>{article.date}</span>
                <span>{article.readTime}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-500 mt-2">No articles found</p>
            <button
              onClick={() => { setSearch(""); setSelectedFilter("All") }}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

      </div>
    </MainLayout>
  )
}