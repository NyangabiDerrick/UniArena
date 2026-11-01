"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { Send, Search, Plus, MessageSquare, Flag, Ban } from "lucide-react"
import {
  getConversations, getContacts, getThread, sendMessage,
  getBlocks, blockUser, unblockUser, reportUser,
  type Conversation, type Partner, type ChatMessage, type ReportReason
} from "@/lib/messagesApi"
import { usePolling } from "@/lib/usePolling"

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment or abuse" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "OTHER", label: "Something else" }
]

const shortTime = (d: string) => {
  const date = new Date(d)
  const sameDay = date.toDateString() === new Date().toDateString()
  return sameDay
    ? date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

const smallBtn: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8,
  border: "1.5px solid #E4E2DC", background: "white", cursor: "pointer",
  fontSize: 12, fontWeight: 500, fontFamily: "'Inter', sans-serif"
}

export default function MessagesPage() {
  const { status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [partner, setPartner] = useState<Partner | null>(null)
  const [thread, setThread] = useState<ChatMessage[]>([])
  const [iBlocked, setIBlocked] = useState(false)
  const [text, setText] = useState("")
  const [filter, setFilter] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showBlocked, setShowBlocked] = useState(false)
  const [blocked, setBlocked] = useState<Partner[]>([])
  const [contactSearch, setContactSearch] = useState("")
  const [contacts, setContacts] = useState<Partner[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [reporting, setReporting] = useState(false)
  const [reason, setReason] = useState<ReportReason>("HARASSMENT")
  const [details, setDetails] = useState("")
  const [alsoBlock, setAlsoBlock] = useState(true)
  const [reportBusy, setReportBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const refreshConversations = useCallback(() => {
    getConversations().then(setConversations).catch(() => {})
  }, [])

  const refreshBlocked = useCallback(() => {
    getBlocks().then(setBlocked).catch(() => {})
  }, [])

  // Conversation list: load once, then every 15 seconds while the tab is visible
  useEffect(() => {
    if (status === "authenticated") refreshConversations()
  }, [status, refreshConversations])
  usePolling(refreshConversations, 15000, status === "authenticated")

  // Open conversation: load on open, then every 5 seconds while the tab is visible
  const partnerId = partner?.id
  const activePartner = useRef<string | undefined>(undefined)

  const loadThread = useCallback(() => {
    const id = partnerId
    if (!id) return
    getThread(id)
      .then(d => {
        // Ignore a slow answer that arrives after you switched to someone else
        if (activePartner.current !== id) return
        setThread(d.messages)
        setIBlocked(d.blockedByMe)
      })
      .catch(() => {})
  }, [partnerId])

  useEffect(() => {
    activePartner.current = partnerId
    if (status === "authenticated" && partnerId) loadThread()
  }, [status, partnerId, loadThread])
  usePolling(loadThread, 5000, status === "authenticated" && !!partnerId)

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
    if (status !== "authenticated" || !showBlocked) return
    refreshBlocked()
  }, [status, showBlocked, refreshBlocked])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread.length, partnerId])

  const openConversation = (p: Partner) => {
    setPartner(p)
    setThread([])
    setIBlocked(false)
    setError("")
    setNotice("")
    setShowNew(false)
    setShowBlocked(false)
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

  const block = async () => {
    if (!partner) return
    if (!window.confirm(`Block ${partner.name}? Neither of you will be able to message the other.`)) return
    try {
      await blockUser(partner.id)
      setIBlocked(true)
      setNotice(`${partner.name} is blocked.`)
      refreshConversations()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not block")
    }
  }

  const unblock = async (p: Partner) => {
    try {
      await unblockUser(p.id)
      if (partner?.id === p.id) setIBlocked(false)
      setNotice(`${p.name} is unblocked.`)
      refreshBlocked()
      refreshConversations()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not unblock")
    }
  }

  const submitReport = async () => {
    if (!partner) return
    setReportBusy(true)
    setError("")
    try {
      await reportUser(partner.id, reason, details.trim())
      if (alsoBlock) {
        await blockUser(partner.id)
        setIBlocked(true)
        refreshConversations()
      }
      setNotice("Report sent. An administrator will review it.")
      setReporting(false)
      setDetails("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the report")
      setReporting(false)
    } finally {
      setReportBusy(false)
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
                <button onClick={() => { setShowNew(s => !s); setShowBlocked(false) }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "#0B1D3A", color: "white", fontSize: 12, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
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
              {showBlocked ? (
                blocked.length === 0 ? (
                  <p style={{ padding: 20, fontSize: 13, color: "#9CA3AF" }}>You haven&apos;t blocked anyone.</p>
                ) : blocked.map(p => (
                  <div key={p.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0B1D3A" }}>{p.name}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF" }}>{p.subtitle}</p>
                    </div>
                    <button onClick={() => unblock(p)} style={{ ...smallBtn, color: "#0B1D3A" }}>Unblock</button>
                  </div>
                ))
              ) : showNew ? (
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

            <div style={{ padding: "10px 16px", borderTop: "1px solid #E4E2DC" }}>
              <button onClick={() => { setShowBlocked(s => !s); setShowNew(false) }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6B6962", textDecoration: "underline", fontFamily: "'Inter', sans-serif" }}>
                {showBlocked ? "Back to conversations" : "Blocked people"}
              </button>
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
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #E4E2DC", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: "#0B1D3A", color: "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{partner.name.charAt(0)}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#0B1D3A" }}>{partner.name}</p>
                      <p style={{ fontSize: 11, color: "#9CA3AF" }}>{partner.subtitle}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => { setReporting(true); setError("") }} style={{ ...smallBtn, color: "#C2410C" }}>
                      <Flag size={13} /> Report
                    </button>
                    {!iBlocked && !partner.subtitle.startsWith("Administrator") && (
                      <button onClick={block} style={{ ...smallBtn, color: "#DC2626" }}>
                        <Ban size={13} /> Block
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  {thread.length === 0 && <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 40 }}>No messages yet. Say hello.</p>}