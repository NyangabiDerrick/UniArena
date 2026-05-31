"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Search, Trophy, Users } from "lucide-react"
import Link from "next/link"

const sports = [
  "All", "Football", "Basketball", "Swimming",
  "Athletics", "Rugby", "Tennis", "Cricket", "Volleyball"
]

const mockTeams = [
  {
    id: "1",
    name: "UniArena FC",
    sport: "Football",
    description: "The university's flagship football team competing in the national university league.",
    memberCount: 25,
    season: "2025/26",
    wins: 8,
    losses: 2,
    draws: 1
  },
  {
    id: "2",
    name: "UniArena Ballers",
    sport: "Basketball",
    description: "Our basketball team competing in the regional university basketball championship.",
    memberCount: 15,
    season: "2025/26",
    wins: 6,
    losses: 4,
    draws: 0
  },
  {
    id: "3",
    name: "UniArena Swim Team",
    sport: "Swimming",
    description: "Competitive swimming across all strokes and distances at national level.",
    memberCount: 20,
    season: "2025/26",
    wins: 10,
    losses: 1,
    draws: 0
  },
  {
    id: "4",
    name: "UniArena Athletics",
    sport: "Athletics",
    description: "Track and field athletes representing the university at regional competitions.",
    memberCount: 30,
    season: "2025/26",
    wins: 5,
    losses: 3,
    draws: 2
  },
  {
    id: "5",
    name: "UniArena Rugby",
    sport: "Rugby",
    description: "Fifteen-a-side rugby competing in the university rugby union league.",
    memberCount: 28,
    season: "2025/26",
    wins: 4,
    losses: 5,
    draws: 1
  },
  {
    id: "6",
    name: "UniArena Tennis",
    sport: "Tennis",
    description: "Singles and doubles tennis players competing at university level.",
    memberCount: 12,
    season: "2025/26",
    wins: 7,
    losses: 2,
    draws: 0
  }
]

const sportEmoji: Record<string, string> = {
  Football: "⚽",
  Basketball: "🏀",
  Swimming: "🏊",
  Athletics: "🏃",
  Rugby: "🏉",
  Tennis: "🎾",
  Cricket: "🏏",
  Volleyball: "🏐"
}

export default function SportsPage() {
  const [search, setSearch] = useState("")
  const [selectedSport, setSelectedSport] = useState("All")

  const filtered = mockTeams.filter(team => {
    const matchesSearch =
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.sport.toLowerCase().includes(search.toLowerCase())
    const matchesSport =
      selectedSport === "All" || team.sport === selectedSport
    return matchesSearch && matchesSport
  })

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sports Teams</h1>
          <p className="text-gray-500 mt-1">
            Follow your university sports teams and stay up to date with fixtures and results
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sports teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Sport Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {sports.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3 py-1.5 text-sm rounded-full border transition ${
                selectedSport === sport
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {sport !== "All" && sportEmoji[sport]} {sport}
            </button>
          ))}
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((team) => (
            <Link
              key={team.id}
              href={`/sports/${team.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition group"
            >
              {/* Sport Icon */}
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-3 text-2xl">
                {sportEmoji[team.sport] || "🏆"}
              </div>

              {/* Team Info */}
              <div className="mb-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {team.name}
                  </h3>
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {team.sport}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {team.description}
                </p>
              </div>

              {/* Season Record */}
              <div className="flex items-center gap-3 py-3 border-t border-gray-50 text-xs">
                <span className="text-green-600 font-medium">W {team.wins}</span>
                <span className="text-red-600 font-medium">L {team.losses}</span>
                <span className="text-gray-500 font-medium">D {team.draws}</span>
                <div className="flex items-center gap-1 text-gray-400 ml-auto">
                  <Users className="w-3.5 h-3.5" />
                  {team.memberCount}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-500 mt-2">
              No teams found matching your search
            </p>
            <button
              onClick={() => { setSearch(""); setSelectedSport("All") }}
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