"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { inputStyle, labelStyle, primaryButton, errorBox, successBox } from "@/components/layout/AuthShell"
import { getArticleCategories, createArticle, CATEGORY_LABELS, type ArticleCategory } from "@/lib/contentApi"

export default function PostNewsPage() {
  const { data: session, status } = useSession()
  const [allowed, setAllowed] = useState<ArticleCategory[] | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState("")

  const role = session?.user?.role
  const permitted = role === "CLUB_LEADER" || role === "ADMIN"

  useEffect(() => {
    if (status !== "authenticated" || !permitted) return
    getArticleCategories()
      .then(setAllowed)
      .catch(e => setError(e instanceof Error ? e.message : "Could not load categories"))
  }, [status, permitted])

  const chosen = (category || allowed?.[0] || "") as ArticleCategory | ""

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setDone("")
    if (!chosen) return setError("Pick a category")
    if (content.trim().length < 20) return setError("The article must be at least 20 characters")

    setBusy(true)
    try {
      const message = await createArticle({
        title: title.trim(), category: chosen, content: content.trim(),
        tags: tags.split(",").map(t => t.trim()).filter(Boolean)
      })
      setDone(message)
      setTitle(""); setContent(""); setTags("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post the article")
    } finally {
      setBusy(false)
    }
  }

  if (status === "authenticated" && !permitted) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only club leaders and administrators can post news.</p></MainLayout>
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 6 }}>Post news</h1>
        <p style={{ fontSize: 14, color: "#6B6962", marginBottom: 28 }}>
          {role === "ADMIN" ? "Articles you post are published straight away." : "Your article is reviewed by an administrator before it appears."}
        </p>

        {error && <div style={errorBox}>{error}</div>}
        {done && <div style={successBox}>{done}</div>}

        {allowed && allowed.length === 0 ? (
          <div style={errorBox}>You haven&apos;t been assigned a club, society or team yet, so you can&apos;t post news.</div>
        ) : (
          <form onSubmit={submit} style={{ background: "white", borderRadius: 16, border: "1px solid #E4E2DC", padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Headline</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Category</label>
              <select value={chosen} onChange={e => setCategory(e.target.value)} required style={inputStyle}>
                {(allowed ?? []).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
              {allowed && allowed.length === 1 && (
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>This is the only category available for your group.</p>
              )}
            </div>

            <div>
              <label style={labelStyle}>Article</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} required rows={10} maxLength={20000}
                placeholder="Write the story. Leave a blank line between paragraphs."
                style={{ ...inputStyle, resize: "vertical" }} />
              <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>{content.length}/20000</p>
            </div>

            <div>
              <label style={labelStyle}>Tags (optional, separated by commas)</label>
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="football, championship" style={inputStyle} />
            </div>

            <button type="submit" disabled={busy || !allowed} style={primaryButton(busy || !allowed)}>
              {busy ? "Saving..." : role === "ADMIN" ? "Publish article" : "Submit for approval"}
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  )
}