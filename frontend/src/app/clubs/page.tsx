"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Users, Filter } from "lucide-react"
import Link from "next/link"

const categories = [
  "All",
  "Cultural",
  "Academic",
  "Arts",
  "Religious",
  "Sports",
  "Political",
  "Technology",
  "Social"
]

const mockClubs = [
  {
    id: "1",
    name: "Photography Society",
    category: "Arts",
    description: "A club for photography enthusiasts on campus. We organise photo walks, exhibitions and workshops.",
    memberCount: 124,
    status: "ACTIVE",
    logoUrl: null
  },
  {
    id: "2",
    name: "Chess Club",
    category: "Academic",
    description: "Competitive and recreational chess for all skill levels. Weekly tournaments and training sessions.",
    memberCount: 56,
    status: "ACTIVE",
    logoUrl: null
  },
  {
    id: "3",
    name: "African Culture Society",
    category: "Cultural",
    description: "Celebrating African heritage through music, dance, food and cultural events.",
    memberCount: 210,
    status: "ACTIVE",
    logoUrl: null
  },
  {
    id: "4",
    name: "Coding Bootcamp",
    category: "Technology",
    description: "Weekly coding sessions, hackathons and tech talks for all skill levels.",
    memberCount: 89,
    status: "ACTIVE",
    logoUrl: null
  },
  {
    id: "5",
    name: "Debate Society",
    category: "Academic",
    description: "Sharpen your public speaking and critical thinking through competitive debate.",
    memberCount: 67,
    status: "ACTIVE",
    logoUrl: null
  },
  {
    id: "6",
    name: "Drama Club",
    category: "Arts",
    description: "Acting, directing and stagecraft. We perform two major productions per year.",
    memberCount: 43,
    status: "ACTIVE",
    logoUrl: null
  },
  {
    id: "7",
    name: "Muslim Students Association",
    category: "Religious",
    description: "A community for Muslim students on campus. Weekly prayers, events and support.",
    memberCount: 178,
    status: "ACTIVE",
    logoUrl: null
  },
  {
    id: "8",
    name: "Entrepreneurship Club",
    category: "Academic",
    description: "Building the next generation of entrepreneurs through mentorship and pitch competitions.",
    memberCount: 95,
    status: "ACTIVE",
    logoUrl: null
  }
]

export default function ClubsPage() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filtered = mockClubs.filter(club => {
    const matchesSearch =
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || club.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Clubs & Societies</h1>
          <p className="text-gray-500 mt-1">
            Discover and join clubs that match your interests
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clubs and societies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-full border transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} club{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition group"
            >
              {/* Club Logo */}
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition">
                <span className="text-blue-600 font-bold text-lg">
                  {club.name.charAt(0)}
                </span>
              </div>

              {/* Club Info */}
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {club.name}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {club.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {club.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="w-3.5 h-3.5" />
                  <span className="text-xs">{club.memberCount} members</span>
                </div>
                <span className="text-xs text-blue-600 font-medium group-hover:underline">
                  View club
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-500 mt-2">
              No clubs found matching your search
            </p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All") }}
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