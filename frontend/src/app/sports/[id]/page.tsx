"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy
} from "lucide-react"
import Link from "next/link"

const mockTeam = {
  id: "1",
  name: "UniArena FC",
  sport: "Football",
  season: "2025/26",
  description: "The university flagship football team competing in the national university league. Founded in 1998, we have won the national championship 3 times.",
  memberCount: 25,
  wins: 8,
  losses: 2,
  draws: 1,
  squad: [
    { id: "1", name: "James Keeper", position: "Goalkeeper", isAvailable: true },
    { id: "2", name: "Mark Right", position: "Defender", isAvailable: true },
    { id: "3", name: "Luke Centre", position: "Defender", isAvailable: false },
    { id: "4", name: "Paul Left", position: "Defender", isAvailable: true },
    { id: "5", name: "Tom Mid", position: "Midfielder", isAvailable: true },
    { id: "6", name: "Sam Box", position: "Midfielder", isAvailable: true },
    { id: "7", name: "Chris Wide", position: "Midfielder", isAvailable: true },
    { id: "8", name: "Alex Strike", position: "Forward", isAvailable: false },
    { id: "9", name: "Jordan Goal", position: "Forward", isAvailable: true }
  ],
  fixtures: [
    {
      id: "1",
      opposition: "City University",
      venue: "Main Stadium",
      isHome: true,
      scheduledAt: "June 7, 2026",
      status: "UPCOMING"
    },
    {
      id: "2",
      opposition: "Tech University",
      venue: "Tech Campus",
      isHome: false,
      scheduledAt: "June 14, 2026",
      status: "UPCOMING"
    }
  ],
  results: [
    {
      id: "3",
      opposition: "North University",
      isHome: true,
      homeScore: 3,
      awayScore: 1,
      date: "May 24, 2026"
    },
    {
      id: "4",
      opposition: "South College",
      isHome: false,
      homeScore: 0,
      awayScore: 2,
      date: "May 17, 2026"
    },
    {
      id: "5",
      opposition: "East University",
      isHome: true,
      homeScore: 2,
      awayScore: 2,
      date: "May 10, 2026"
    }
  ],
  training: [
    { day: "Tuesday", time: "6:00 PM — 8:00 PM", venue: "Main Pitch" },
    { day: "Thursday", time: "6:00 PM — 8:00 PM", venue: "Main Pitch" },
    { day: "Saturday", time: "10:00 AM — 12:00 PM", venue: "Training Ground" }
  ]
}

const tabs = ["Fixtures", "Results", "Squad", "Training"]

export default function SportTeamPage() {
  const [activeTab, setActiveTab] = useState("Fixtures")

  const getResultLabel = (result: typeof mockTeam.results[0]) => {
    const scored = result.isHome ? result.homeScore : result.awayScore
    const conceded = result.isHome ? result.awayScore : result.homeScore
    if (scored > conceded) return { label: "W", color: "text-green-600 bg-green-50" }
    if (scored < conceded) return { label: "L", color: "text-red-600 bg-red-50" }
    return { label: "D", color: "text-gray-600 bg-gray-50" }
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          href="/sports"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sports
        </Link>

        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl h-36 mb-4" />

        {/* Team Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 -mt-10 border-4 border-white shadow-sm text-3xl">
              ⚽
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{mockTeam.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                  {mockTeam.sport}
                </span>
                <span>Season {mockTeam.season}</span>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {mockTeam.memberCount} players
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{mockTeam.description}</p>
            </div>
          </div>

          {/* Season Record */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{mockTeam.wins}</p>
              <p className="text-xs text-gray-500">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{mockTeam.losses}</p>
              <p className="text-xs text-gray-500">Losses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{mockTeam.draws}</p>
              <p className="text-xs text-gray-500">Draws</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-4 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

          {/* Fixtures */}
          {activeTab === "Fixtures" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Upcoming Fixtures</h2>
              {mockTeam.fixtures.length === 0 ? (
                <p className="text-sm text-gray-500">No upcoming fixtures scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {mockTeam.fixtures.map((fixture) => (
                    <div
                      key={fixture.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {fixture.isHome ? "vs" : "@"} {fixture.opposition}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            fixture.isHome
                              ? "bg-green-50 text-green-600"
                              : "bg-orange-50 text-orange-600"
                          }`}>
                            {fixture.isHome ? "Home" : "Away"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{fixture.scheduledAt}</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {fixture.venue}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {activeTab === "Results" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Recent Results</h2>
              <div className="space-y-3">
                {mockTeam.results.map((result) => {
                  const { label, color } = getResultLabel(result)
                  return (
                    <div
                      key={result.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-gray-100"
                    >
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${color}`}>
                        {label}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {result.isHome ? "UniArena FC" : result.opposition}
                          {" "}{result.homeScore} — {result.awayScore}{" "}
                          {result.isHome ? result.opposition : "UniArena FC"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{result.date}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        result.isHome
                          ? "bg-green-50 text-green-600"
                          : "bg-orange-50 text-orange-600"
                      }`}>
                        {result.isHome ? "Home" : "Away"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Squad */}
          {activeTab === "Squad" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Squad</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mockTeam.squad.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100"
                  >
                    <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm flex-shrink-0">
                      {player.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-gray-500">{player.position}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      player.isAvailable
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {player.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training */}
          {activeTab === "Training" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Training Schedule</h2>
              <div className="space-y-3">
                {mockTeam.training.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Trophy className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{session.day}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span>{session.time}</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.venue}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  )
}