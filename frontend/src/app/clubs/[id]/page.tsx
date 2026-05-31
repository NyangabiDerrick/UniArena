"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { useSession } from "next-auth/react"
import {
  Users,
  Calendar,
  FileText,
  ArrowLeft,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

const mockClub = {
  id: "1",
  name: "Photography Society",
  category: "Arts",
  description: `Welcome to the Photography Society — one of the most active arts clubs on campus.
  
We are a community of passionate photographers ranging from complete beginners to advanced practitioners. Our goal is to share knowledge, inspire creativity, and build a supportive community around the art of photography.

We organise weekly photo walks around campus and the city, monthly exhibitions showcasing member work, and regular workshops covering everything from composition basics to advanced editing techniques.`,
  memberCount: 124,
  foundedAt: "2019",
  status: "ACTIVE",
  committee: [
    { name: "Jane Leader", role: "President" },
    { name: "Tom Brown", role: "Secretary" },
    { name: "Lisa Chen", role: "Treasurer" },
    { name: "Mark Davis", role: "Events Coordinator" }
  ],
  upcomingEvents: [
    {
      id: "1",
      title: "Campus Photo Walk",
      date: "June 5, 2026",
      venue: "Main Campus"
    },
    {
      id: "2",
      title: "Portrait Photography Workshop",
      date: "June 12, 2026",
      venue: "Arts Building Room 204"
    }
  ],
  recentNews: [
    {
      id: "1",
      title: "Our members won 3 awards at the National Photography Competition",
      date: "May 20, 2026"
    },
    {
      id: "2",
      title: "New darkroom equipment now available for members",
      date: "May 10, 2026"
    }
  ]
}

const tabs = ["About", "Events", "News", "Members", "Committee"]

export default function ClubProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("About")
  const [joined, setJoined] = useState(false)

  const handleJoin = () => {
    setJoined(true)
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          href="/clubs"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clubs
        </Link>

        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl h-36 mb-4" />

        {/* Club Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 -mt-10 border-4 border-white shadow-sm">
                <span className="text-blue-600 font-bold text-2xl">
                  {mockClub.name.charAt(0)}
                </span>
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">{mockClub.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {mockClub.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {mockClub.memberCount} members
                  </div>
                  <span>Founded {mockClub.foundedAt}</span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            {session?.user?.role === "STUDENT" && (
              <button
                onClick={handleJoin}
                disabled={joined}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition flex-shrink-0 ${
                  joined
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {joined ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Request Sent
                  </>
                ) : (
                  "Join Club"
                )}
              </button>
            )}
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

          {/* About */}
          {activeTab === "About" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {mockClub.description}
              </p>
            </div>
          )}

          {/* Events */}
          {activeTab === "Events" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Upcoming Events</h2>
              <div className="space-y-3">
                {mockClub.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.date} — {event.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News */}
          {activeTab === "News" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Recent News</h2>
              <div className="space-y-3">
                {mockClub.recentNews.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{article.title}</p>
                      <p className="text-xs text-gray-500">{article.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {activeTab === "Members" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Members</h2>
              <p className="text-sm text-gray-500">
                This club has {mockClub.memberCount} members.
                Member list is visible to club members only.
              </p>
            </div>
          )}

          {/* Committee */}
          {activeTab === "Committee" && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Committee</h2>
              <div className="space-y-3">
                {mockClub.committee.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
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