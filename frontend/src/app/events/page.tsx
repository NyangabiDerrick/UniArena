"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Calendar, MapPin, Clock, Users, Search } from "lucide-react"
import Link from "next/link"

const categories = ["All", "Club", "Sports", "University", "Academic", "Social"]

const mockEvents = [
  {
    id: "1",
    title: "Annual Sports Day",
    description: "The biggest sporting event of the year featuring competitions across 10 sports.",
    category: "Sports",
    date: "June 7, 2026",
    time: "9:00 AM",
    venue: "Main Stadium",
    organiser: "Sports Department",
    capacity: 500,
    sold: 342,
    isFree: true,
    price: 0
  },
  {
    id: "2",
    title: "Photography Exhibition",
    description: "Annual showcase of the best photography work from our Photography Society members.",
    category: "Club",
    date: "June 10, 2026",
    time: "2:00 PM",
    venue: "Arts Building Gallery",
    organiser: "Photography Society",
    capacity: 150,
    sold: 89,
    isFree: true,
    price: 0
  },
  {
    id: "3",
    title: "Entrepreneurship Pitch Night",
    description: "Student entrepreneurs pitch their startup ideas to a panel of industry judges.",
    category: "Academic",
    date: "June 12, 2026",
    time: "6:00 PM",
    venue: "Business School Auditorium",
    organiser: "Entrepreneurship Club",
    capacity: 200,
    sold: 167,
    isFree: false,
    price: 5
  },
  {
    id: "4",
    title: "African Culture Night",
    description: "A celebration of African heritage through music, dance, food and art.",
    category: "Social",
    date: "June 15, 2026",
    time: "7:00 PM",
    venue: "Student Union Hall",
    organiser: "African Culture Society",
    capacity: 300,
    sold: 201,
    isFree: false,
    price: 10
  },
  {
    id: "5",
    title: "Inter-University Debate",
    description: "UniArena's debate team takes on teams from 5 other universities.",
    category: "Academic",
    date: "June 18, 2026",
    time: "10:00 AM",
    venue: "Law Faculty Moot Room",
    organiser: "Debate Society",
    capacity: 100,
    sold: 45,
    isFree: true,
    price: 0
  },
  {
    id: "6",
    title: "End of Year Concert",
    description: "The biggest social event of the year featuring live performances and DJ sets.",
    category: "Social",
    date: "June 25, 2026",
    time: "8:00 PM",
    venue: "Open Air Amphitheatre",
    organiser: "Student Union",
    capacity: 1000,
    sold: 876,
    isFree: false,
    price: 15
  }
]

const categoryColors: Record<string, string> = {
  Club: "bg-blue-50 text-blue-600",
  Sports: "bg-orange-50 text-orange-600",
  University: "bg-purple-50 text-purple-600",
  Academic: "bg-green-50 text-green-600",
  Social: "bg-pink-50 text-pink-600"
}

export default function EventsPage() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showFreeOnly, setShowFreeOnly] = useState(false)

  const filtered = mockEvents.filter(event => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.organiser.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory
    const matchesFree = !showFreeOnly || event.isFree
    return matchesSearch && matchesCategory && matchesFree
  })

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">
            Discover upcoming events across clubs, sports and the university
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer bg-white border border-gray-200 px-4 py-2.5 rounded-xl">
            <input
              type="checkbox"
              checked={showFreeOnly}
              onChange={(e) => setShowFreeOnly(e.target.checked)}
              className="rounded"
            />
            Free events only
          </label>
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
          Showing {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Events List */}
        <div className="space-y-4">
          {filtered.map((event) => {
            const spotsLeft = event.capacity - event.sold
            const isSoldOut = spotsLeft === 0
            const percentFull = Math.round((event.sold / event.capacity) * 100)

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-100 transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">

                    {/* Category and Free badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[event.category] || "bg-gray-50 text-gray-600"}`}>
                        {event.category}
                      </span>
                      {event.isFree && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                          Free
                        </span>
                      )}
                      {isSoldOut && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.venue}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {spotsLeft} spots left
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            percentFull >= 90
                              ? "bg-red-500"
                              : percentFull >= 70
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${percentFull}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {event.sold} / {event.capacity} registered
                      </p>
                    </div>

                  </div>

                  {/* Price and CTA */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      {event.isFree ? "Free" : `$${event.price}`}
                    </p>
                    <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                      isSoldOut
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-600 text-white group-hover:bg-blue-700"
                    }`}>
                      {isSoldOut ? "Sold Out" : event.isFree ? "RSVP" : "Get Ticket"}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">🔍</span>
            <p className="text-gray-500 mt-2">No events found matching your search</p>
            <button
              onClick={() => { setSearch(""); setSelectedCategory("All"); setShowFreeOnly(false) }}
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