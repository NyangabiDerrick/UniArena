"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Image, Play } from "lucide-react"

const filters = ["All", "Clubs", "Sports", "Events"]

const mockGalleries = [
  {
    id: "1",
    name: "Sports Day 2026",
    club: "Sports Department",
    category: "Sports",
    mediaCount: 45,
    coverEmoji: "🏆",
    coverColor: "from-orange-400 to-red-500",
    date: "May 2026"
  },
  {
    id: "2",
    name: "Photography Exhibition",
    club: "Photography Society",
    category: "Clubs",
    mediaCount: 32,
    coverEmoji: "📸",
    coverColor: "from-purple-400 to-pink-500",
    date: "April 2026"
  },
  {
    id: "3",
    name: "Football Championship Final",
    club: "UniArena FC",
    category: "Sports",
    mediaCount: 78,
    coverEmoji: "⚽",
    coverColor: "from-blue-400 to-blue-600",
    date: "May 2026"
  },
  {
    id: "4",
    name: "African Culture Night",
    club: "African Culture Society",
    category: "Events",
    mediaCount: 56,
    coverEmoji: "🎭",
    coverColor: "from-yellow-400 to-orange-500",
    date: "March 2026"
  },
  {
    id: "5",
    name: "Freshers Week 2025",
    club: "Student Union",
    category: "Events",
    mediaCount: 120,
    coverEmoji: "🎉",
    coverColor: "from-green-400 to-teal-500",
    date: "September 2025"
  },
  {
    id: "6",
    name: "Swimming Regional Meet",
    club: "UniArena Swim Team",
    category: "Sports",
    mediaCount: 28,
    coverEmoji: "🏊",
    coverColor: "from-cyan-400 to-blue-500",
    date: "May 2026"
  }
]

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState("All")

  const filtered = mockGalleries.filter(gallery =>
    selectedFilter === "All" || gallery.category === selectedFilter
  )

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
          <p className="text-gray-500 mt-1">
            Photos and videos from clubs, sports and university events
          </p>
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

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((gallery) => (
            <div
              key={gallery.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group cursor-pointer"
            >
              {/* Cover */}
              <div className={`bg-gradient-to-br ${gallery.coverColor} h-40 flex items-center justify-center relative`}>
                <span className="text-5xl">{gallery.coverEmoji}</span>
                <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Image className="w-3 h-3" />
                  {gallery.mediaCount}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">
                  {gallery.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{gallery.club}</span>
                  <span>{gallery.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </MainLayout>
  )
}