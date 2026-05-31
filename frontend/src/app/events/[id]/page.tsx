"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle
} from "lucide-react"
import Link from "next/link"

const mockEvent = {
  id: "1",
  title: "Annual Sports Day",
  description: `Join us for the biggest sporting event of the year at UniArena.

Annual Sports Day features competitions across 10 different sports including football, basketball, swimming, athletics, tennis, and more. Whether you are competing or cheering, this is a day not to be missed.

The event will run from 9:00 AM to 6:00 PM with a prize giving ceremony at the end of the day. Food stalls and entertainment will be available throughout the day.

All students, staff and their families are welcome to attend.`,
  category: "Sports",
  date: "June 7, 2026",
  time: "9:00 AM — 6:00 PM",
  venue: "Main Stadium, UniArena Campus",
  organiser: "Sports Department",
  capacity: 500,
  sold: 342,
  isFree: true,
  price: 0,
  ticketTypes: [
    { id: "1", name: "General Admission", price: 0, available: 158 },
  ]
}

export default function EventDetailPage() {
  const [selectedTicket, setSelectedTicket] = useState(mockEvent.ticketTypes[0])
  const [quantity, setQuantity] = useState(1)
  const [purchased, setPurchased] = useState(false)

  const spotsLeft = mockEvent.capacity - mockEvent.sold

  const handlePurchase = () => {
    setPurchased(true)
  }

  if (purchased) {
    return (
      <MainLayout>
        <div className="max-w-lg mx-auto text-center py-12">

          {/* Success */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {mockEvent.isFree ? "RSVP Confirmed!" : "Ticket Confirmed!"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your ticket for {mockEvent.title} has been confirmed.
              Check your email for the QR code.
            </p>

            {/* QR Code Placeholder */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 mb-6">
              <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <p className="text-xs text-gray-500">QR Code sent to your university email</p>
            </div>

            {/* Event Details */}
            <div className="text-left space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                {mockEvent.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                {mockEvent.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                {mockEvent.venue}
              </div>
            </div>

            <Link
              href="/events"
              className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Back to Events
            </Link>
          </div>

        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl h-48 mb-6 flex items-center justify-center">
          <span className="text-6xl">🏆</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">

            {/* Event Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                  {mockEvent.category}
                </span>
                {mockEvent.isFree && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                    Free
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{mockEvent.title}</h1>
              <p className="text-sm text-gray-500">Organised by {mockEvent.organiser}</p>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">Event Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  {mockEvent.date}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  {mockEvent.time}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-green-600" />
                  </div>
                  {mockEvent.venue}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-orange-600" />
                  </div>
                  {spotsLeft} spots remaining out of {mockEvent.capacity}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-3">About this Event</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                {mockEvent.description}
              </p>
            </div>

          </div>

          {/* Ticket Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">
                {mockEvent.isFree ? "Reserve Your Spot" : "Get Tickets"}
              </h2>

              {/* Ticket Types */}
              <div className="space-y-2 mb-4">
                {mockEvent.ticketTypes.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedTicket.id === ticket.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{ticket.name}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ticket.available} available
                    </p>
                  </div>
                ))}
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    -
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(5, quantity + 1))}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 border-t border-gray-100 mb-4">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-bold text-gray-900">
                  {selectedTicket.price === 0
                    ? "Free"
                    : `$${selectedTicket.price * quantity}`}
                </span>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                {mockEvent.isFree ? "Confirm RSVP" : "Purchase Ticket"}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                QR code will be sent to your university email
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}