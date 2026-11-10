"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import { errorMessage } from "@/lib/types"
import { CLUB_CATEGORIES } from "@/lib/adminGroupsApi"

const card: React.CSSProperties = { background: "white", borderRadius: 16, border: "1px solid #E4E2DC", padding: 28 }
const input: React.CSSProperties = { width: "100%", padding: "11px 12px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", outline: "none", fontFamily: "'Inter', sans-serif", background: "white" }
const lab: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "#0B1D3A", marginBottom: 6 }
const primary: React.CSSProperties = { padding: "11px 20px", borderRadius: 10, border: "none", background: "#0B1D3A", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif" }

export default function EditClubPage() {
  const { data: session, status } = useSession()
  const role = session?.user?.role
  const permitted = role === "CLUB_LEADER"

  const [loaded, setLoaded] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", category: CLUB_CATEGORIES[0], type: "CLUB" as "CLUB" | "SOCIETY" })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (status !== "authenticated" || !permitted) return
    let cancelled = false
    api.getMyClub()
      .then(res => {
        if (cancelled) return
        const c = res.data
        setForm({
          name: c.name,
          description: c.description ?? "",
          category: c.category,
          type: c.type === "SOCIETY" ? "SOCIETY" : "CLUB"
        })
        setLoaded(true)
      })
      .catch(err => { if (!cancelled) setError(errorMessage(err)) })
    return () => { cancelled = true }
  }, [status, permitted])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setNotice("")
    setError("")
    try {
      setNotice(await api.updateMyClub({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        type: form.type
      }).then(r => r.message))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (status === "authenticated" && !permitted) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only club leaders can edit their club here.</p></MainLayout>
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <Link href="/clubs/manage" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B6962", textDecoration: "none", marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to Manage Club
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>Edit club details</h1>
        <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 24 }}>Name, category, type and description. Logo and banner are changed under Group Images.</p>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        {!loaded ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : (
          <form onSubmit={save} style={{ ...card, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={lab}>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={100} style={input} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lab}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={input}>
                  {CLUB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lab}>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as "CLUB" | "SOCIETY" })} style={input}>
                  <option value="CLUB">Club</option>
                  <option value="SOCIETY">Society</option>
                </select>
              </div>
            </div>

            <div>
              <label style={lab}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={6} maxLength={1000}
                placeholder="What the group does, who can join, when it meets. Leave a blank line between paragraphs."
                style={{ ...input, resize: "vertical" }} />
              <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{form.description.length}/1000</p>
            </div>

            <div>
              <button type="submit" disabled={saving} style={{ ...primary, opacity: saving ? 0.6 : 1 }}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  )
}