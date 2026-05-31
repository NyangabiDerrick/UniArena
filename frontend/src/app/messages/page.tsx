"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Send, Search } from "lucide-react"

const mockConversations = [
  {
    id: "1",
    name: "Jane Leader",
    role: "Club Leader — Photography Society",
    lastMessage: "Hi, your membership request has been approved!",
    time: "2 min ago",
    unread: 1,
    avatar: "J"
  },
  {
    id: "2",
    name: "Mike Captain",
    role: "Sports Captain — UniArena FC",
    lastMessage: "Training is at 6pm on Thursday at the main pitch.",
    time: "1 hour ago",
    unread: 0,
    avatar: "M"
  },
  {
    id: "3",
    name: "Sarah Admin",
    role: "Super Admin",
    lastMessage: "Welcome to UniArena! Let us know if you need help.",
    time: "Yesterday",
    unread: 0,
    avatar: "S"
  }
]

const mockMessages = [
  {
    id: "1",
    senderId: "2",
    content: "Hi there! Welcome to UniArena.",
    time: "10:00 AM"
  },
  {
    id: "2",
    senderId: "1",
    content: "Thank you! I just joined the Photography Society.",
    time: "10:02 AM"
  },
  {
    id: "3",
    senderId: "2",
    content: "That is great! They have amazing events coming up.",
    time: "10:03 AM"
  },
  {
    id: "4",
    senderId: "2",
    content: "Hi, your membership request has been approved!",
    time: "10:05 AM"
  }
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)
  const [search, setSearch] = useState("")
  const currentUserId = "1"

  const handleSend = () => {
    if (!message.trim()) return
    setMessages(prev => [
      ...prev,
      {
        id: String(prev.length + 1),
        senderId: currentUserId,
        content: message,
        time: "Now"
      }
    ])
    setMessage("")
  }

  const filtered = mockConversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
          <div className="flex h-full">

            {/* Conversations List */}
            <div className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0">

              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <h1 className="font-semibold text-gray-900 mb-3">Messages</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filtered.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`flex items-start gap-3 p-4 cursor-pointer transition border-b border-gray-50 ${
                      selectedConversation.id === conv.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conv.name}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {conv.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col">

              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {selectedConversation.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedConversation.name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedConversation.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUserId
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  )
}