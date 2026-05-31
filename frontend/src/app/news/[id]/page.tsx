"use client"

import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

const mockArticle = {
  id: "1",
  title: "UniArena FC wins the National University Football Championship",
  content: `After a thrilling final against City University, our football team clinched the national title with a 3-1 victory in front of 2,000 fans at the National Stadium.

The match started with UniArena FC taking an early lead through a stunning free kick from captain Alex Strike in the 12th minute. City University equalised shortly before half time, setting up a tense second half.

The turning point came in the 67th minute when substitute Jordan Goal scored with his first touch to restore the lead. A third goal in injury time sealed the championship for UniArena FC.

Head coach Michael Williams said the team had worked incredibly hard all season and deserved the title. The players celebrated with the large travelling support who made the journey to cheer them on.

This is the third national championship title for UniArena FC and the first in eight years. The team will now represent the university in the international universities cup next semester.

Congratulations to the entire squad, coaching staff and all supporters who made this possible.`,
  author: "Sports Reporter",
  club: "UniArena FC",
  category: "Sports",
  date: "May 28, 2026",
  readTime: "3 min read",
  isPinned: true
}

export default function ArticlePage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News
        </Link>

        {/* Article */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-48 flex items-center justify-center">
            <span className="text-6xl">⚽</span>
          </div>

          <div className="p-6">

            {/* Category */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                {mockArticle.category}
              </span>
              <span className="text-xs text-gray-500">{mockArticle.club}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {mockArticle.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pb-4 mb-6 border-b border-gray-100">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {mockArticle.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {mockArticle.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {mockArticle.readTime}
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm max-w-none">
              {mockArticle.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-gray-600 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

          </div>
        </div>

      </div>
    </MainLayout>
  )
}