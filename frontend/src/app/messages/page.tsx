"use client"

import { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Send, Search } from "lucide-react"

const mockConversations = [
  { id:"1", name:"Jane Leader", role:"Club Leader — Photography Society", lastMessage:"Hi, your membership request has been approved!", time:"2 min ago", unread:1, avatar:"J" },
  { id:"2", name:"Mike Captain", role:"Sports Captain — UniArena FC", lastMessage:"Training is at 6pm on Thursday at the main pitch.", time:"1 hour ago", unread:0, avatar:"M" },
  { id:"3", name:"Sarah Admin", role:"Super Admin", lastMessage:"Welcome to UniArena! Let us know if you need help.", time:"Yesterday", unread:0, avatar:"S" },
]

const mockMessages = [
  { id:"1", senderId:"2", content:"Hi there! Welcome to UniArena.", time:"10:00 AM" },
  { id:"2", senderId:"1", content:"Thank you! I just joined the Photography Society.", time:"10:02 AM" },
  { id:"3", senderId:"2", content:"That is great! They have amazing events coming up.", time:"10:03 AM" },
  { id:"4", senderId:"2", content:"Hi, your membership request has been approved!", time:"10:05 AM" },
]

export default function MessagesPage() {
  const [selectedConv, setSelectedConv] = useState(mockConversations[0])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState(mockMessages)
  const [search, setSearch] = useState("")
  const currentUserId = "1"

  const handleSend = () => {
    if (!message.trim()) return
    setMessages(prev => [...prev, { id: String(prev.length + 1), senderId: currentUserId, content: message, time: "Now" }])
    setMessage("")
  }

  const filtered = mockConversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{
          background: "white", borderRadius: 16, border: "1px solid #E4E2DC",
          overflow: "hidden", display: "flex",
          height: "calc(100vh - 130px)"
        }}>

          {/* Conversations */}
          <div style={{
            width: 300, borderRight: "1px solid #E4E2DC",
            display: "flex", flexDirection: "column", flexShrink: 0
          }}>
            <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #E4E2DC" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A", marginBottom: 12 }}>Messages</h2>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{
                  width: "100%", padding: "9px 12px 9px 34px", fontSize: 12,
                  border: "1.5px solid #E4E2DC", borderRadius: 8, outline: "none",
                  fontFamily: "'Inter', sans-serif"
                }} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.map(conv => (
                <div key={conv.id} onClick={() => setSelectedConv(conv)} style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px",
                  cursor: "pointer", borderBottom: "1px solid #F3F4F6",
                  background: selectedConv.id === conv.id ? "#FFFBF0" : "transparent",
                  borderLeft: selectedConv.id === conv.id ? "3px solid #C9A84C" : "3px solid transparent",
                  transition: "background 0.15s"
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: "#0B1D3A", color: "#C9A84C",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 14
                  }}>{conv.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{conv.name}</p>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{conv.time}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#6B6962", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#C9A84C", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 700, flexShrink: 0
                    }}>{conv.unread}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

            {/* Chat header */}
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #E4E2DC",
              display: "flex", alignItems: "center", gap: 12
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: "#0B1D3A", color: "#C9A84C",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14
              }}>{selectedConv.avatar}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{selectedConv.name}</p>
                <p style={{ fontSize: 11, color: "#9CA3AF" }}>{selectedConv.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map(msg => {
                const isMe = msg.senderId === currentUserId
                return (
                  <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "60%", padding: "10px 14px", borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMe ? "#0B1D3A" : "#F3F4F6",
                      color: isMe ? "white" : "#1A1916"
                    }}>
                      <p style={{ fontSize: 13, lineHeight: 1.5 }}>{msg.content}</p>
                      <p style={{ fontSize: 10, marginTop: 4, color: isMe ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}>{msg.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid #E4E2DC", display: "flex", gap: 10 }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                style={{
                  flex: 1, padding: "11px 16px", fontSize: 13, borderRadius: 10,
                  border: "1.5px solid #E4E2DC", outline: "none",
                  fontFamily: "'Inter', sans-serif"
                }}
              />
              <button onClick={handleSend} disabled={!message.trim()} style={{
                width: 42, height: 42, borderRadius: 10, border: "none",
                background: message.trim() ? "#0B1D3A" : "#E4E2DC",
                color: message.trim() ? "white" : "#9CA3AF",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: message.trim() ? "pointer" : "not-allowed", flexShrink: 0
              }}>
                <Send size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  )
}