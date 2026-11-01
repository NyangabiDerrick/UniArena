"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { Send, Search, Plus, MessageSquare } from "lucide-react"
import {
  getConversations, getContacts, getThread, sendMessage,
  type Conversation, type Partner, type ChatMessage
} from "@/lib/messagesApi"

const shortTime = (d: string) => {
  const date = new Date(d)
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export default function MessagesPage() {
  const { status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [partner, setPartner] = useState<Partner | null>(null)
  const [thread, setThread] = useState<ChatMessage[]>([])
  const [text, setText] = useState("")
  const [filter, setFilter] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [contactSearch, setContactSearch] = useState("")
  const [contacts, setContacts] = useState<Partner[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const refreshConversations = useCallback(() => {
    getConversations().then(setConversations).catch(() => {})
  }, [])

  // Conversation list: load now, then every 8 seconds
  useEffect(() => {
    if (status !== "authenticated") return
    refreshConversations()
    const timer = setInterval(refreshConversations, 8000)
    return () => clearInterval(timer)
  }, [status, refreshConversations])

  // Open conversation: load now, then every 5 seconds
  const partnerId = partner?.id
  useEffect(() => {
    if (status !== "authenticated" || !partnerId) return
    let cancelled = false
    const load = () =>
      getThread(partnerId)
        .then(d => { if (!cancelled) setThread(d.messages) })
        .catch(() => {})
    load()
    const timer = setInterval(load, 5000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [status, partnerId])

  // People you may start a conversation with
  useEffect(() => {
    if (status !== "authenticated" || !showNew) return
    let cancelled = false
    const timer = setTimeout(() => {
      getContacts(contactSearch)
        .then(list => { if (!cancelled) setContacts(list) })
        .catch(() => {})
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [status, showNew, contactSearch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread.length, partnerId])

  const openConversation = (p: Partner) => {
    setPartner(p)
    setThread([])
    setError("")
    setShowNew(false)
  }

  const send = async () => {
    const content = text.trim()
    if (!content || !partner || sending) return
    setSending(true)
    setError("")
    try {
      const message = await sendMessage(partner.id, content)
      setThread(prev => [...prev, message])
      setText("")
      refreshConversations()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Message not sent")
    } finally {
      setSending(false)
    }
  }

  const visible = conversations.filter(c => c.partner.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E4E2DC", overflow: "hidden", display: "flex", height: "calc(100vh - 190px)", minHeight: 440 }}>

          {/* Left: conversations */}
          <div style={{ width: 310, borderRight: "1px solid #E4E2DC", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #E4E2DC" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0B1D3A" }}>Messages</h2>
                <button onClick={() => setShowNew(s => !s)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "#0B1D3A", color: "white", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  <Plus size={13} /> New
                </button>
              </div>

              {showNew ? (
                <input autoFocus placeholder="Search people by name..." value={contactSearch} onChange={e => setContactSearch(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", fontSize: 12, border: "1.5px solid #C9A84C", borderRadius: 8, outline: "none", fontFamily: "'Inter', sans-serif" }} />
              ) : (
                <div style={{ position: "relative" }}>
                  <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input placeholder="Search conversations..." value={filter} onChange={e => setFilter(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px 9px 34px", fontSize: 12, border: "1.5px solid #E4E2DC", borderRadius: 8, outline: "none", fontFamily: "'Inter', sans-serif" }} />
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {showNew ? (
                contacts.length === 0 ? (
                  <p style={{ padding: 20, fontSize: 13, color: "#9CA3AF" }}>No matching people.</p>
                ) : contacts.map(p => (
                  <div key={p.id} onClick={() => openConversation(p)} style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #F3F4F6" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{p.name}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>{p.subtitle}</p>
                  </div>
                ))
              ) : visible.length === 0 ? (
                <p style={{ padding: 20, fontSize: 13, color: "#9CA3AF", lineHeight: 1.6 }}>
                  No conversations yet. Press <strong>New</strong> to message someone.
                </p>
              ) : visible.map(c => (
                <div key={c.partner.id} onClick={() => openConversation(c.partner)} style={{
                  display: "flex", gap: 12, padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid #F3F4F6",
                  background: partner?.id === c.partner.id ? "#FFFBF0" : "transparent",
                  borderLeft: partner?.id === c.partner.id ? "3px solid #C9A84C" : "3px solid transparent"
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "#0B1D3A", color: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                    {c.partner.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.partner.name}</p>
                      <span style={{ fontSize: 10, color: "#9CA3AF", flexShrink: 0 }}>{shortTime(c.lastAt)}</span>
                    </div>
                    <p style={{ fontSize: 11, color: c.unread ? "#0B1D3A" : "#6B6962", fontWeight: c.unread ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && (
                    <div style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 99, background: "#C9A84C", color: "#0B1D3A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, alignSelf: "center" }}>{c.unread}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: chat */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {!partner ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <MessageSquare size={40} color="#E4E2DC" />
                <p style={{ fontSize: 14, color: "#6B6962" }}>Choose a conversation or press New to start one.</p>
              </div>
            ) : (
              <>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E2DC", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "#0B1D3A", color: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{partner.name.charAt(0)}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{partner.name}</p>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>{partner.subtitle}</p>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  {thread.length === 0 && <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 40 }}>No messages yet. Say hello.</p>}
                  {thread.map(m => {
                    const mine = m.senderId !== partner.id
                    return (
                      <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                        <div style={{ maxWidth: "65%", padding: "10px 14px", borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: mine ? "#0B1D3A" : "#F3F4F6", color: mine ? "white" : "#1A1916" }}>
                          <p style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.content}</p>
                          <p style={{ fontSize: 10, marginTop: 4, color: mine ? "rgba(255,255,255,0.5)" : "#9CA3AF" }}>{shortTime(m.sentAt)}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {error && <div style={{ padding: "8px 20px", fontSize: 12, color: "#991B1B", background: "#FEF2F2", borderTop: "1px solid #FECACA" }}>{error}</div>}

                <div style={{ padding: "14px 20px", borderTop: "1px solid #E4E2DC", display: "flex", gap: 10 }}>
                  <input placeholder="Type a message..." value={text} maxLength={2000}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && send()}
                    style={{ flex: 1, padding: "11px 16px", fontSize: 13, borderRadius: 10, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif" }} />
                  <button onClick={send} disabled={!text.trim() || sending} aria-label="Send"
                    style={{ width: 42, height: 42, borderRadius: 10, border: "none", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      background: text.trim() && !sending ? "#0B1D3A" : "#E4E2DC", color: text.trim() && !sending ? "white" : "#9CA3AF",
                      cursor: text.trim() && !sending ? "pointer" : "not-allowed" }}>
                    <Send size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}