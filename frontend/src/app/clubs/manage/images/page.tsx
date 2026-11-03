"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import MainLayout from "@/components/layout/MainLayout"
import { ImagePlus, Trash2 } from "lucide-react"
import * as G from "@/lib/groupImagesApi"

const MAX_BYTES = 5 * 1024 * 1024
const TYPES = ["image/jpeg", "image/png", "image/webp"]

const card: React.CSSProperties = { background: "white", borderRadius: 14, border: "1px solid #E4E2DC", padding: 24 }
const btn = (bg: string, color: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none",
  background: bg, color, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif"
})

const msg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong")

interface SlotProps {
  kind: G.ImageKind
  group: G.GroupRef
  url: string | null
  onNotice: (m: string) => void
  onError: (m: string) => void
  onChanged: () => void
}

function ImageSlot({ kind, group, url, onNotice, onError, onChanged }: SlotProps) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const src = G.imageSrc(url)
  const isLogo = kind === "logo"

  const pick = async (file: File | undefined) => {
    if (!file) return
    onError("")
    onNotice("")
    if (!TYPES.includes(file.type)) return onError("Choose a JPEG, PNG or WebP image")
    if (file.size > MAX_BYTES) return onError("The image must be 5 MB or smaller")
    setBusy(true)
    try {
      onNotice(await G.uploadImage(group, kind, file))
      onChanged()
    } catch (e) {
      onError(msg(e))
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ""
    }
  }

  const remove = async () => {
    if (!window.confirm(`Remove the ${kind}?`)) return
    setBusy(true)
    onError("")
    onNotice("")
    try {
      onNotice(await G.removeImage(group, kind))
      onChanged()
    } catch (e) {
      onError(msg(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={card}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: "#0B1D3A", marginBottom: 4 }}>{isLogo ? "Logo" : "Banner"}</h2>
      <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 14 }}>
        {isLogo ? "Square works best. It is cropped to 256 × 256." : "A wide picture works best. It is cropped to 1200 × 400."} JPEG, PNG or WebP, up to 5 MB.
      </p>

      <div style={{
        width: isLogo ? 140 : "100%", aspectRatio: isLogo ? "1 / 1" : "3 / 1", borderRadius: 12, overflow: "hidden",
        background: "#F3F4F6", border: "1px solid #E4E2DC", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14
      }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={`${group.name} ${kind}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>No {kind} yet</span>
        )}
      </div>

      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => pick(e.target.files?.[0])} style={{ display: "none" }} />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => input.current?.click()} disabled={busy} style={{ ...btn(busy ? "#8A9BC0" : "#0B1D3A", "white"), cursor: busy ? "not-allowed" : "pointer" }}>
          <ImagePlus size={14} /> {busy ? "Working..." : src ? "Replace" : "Upload"}
        </button>
        {src && !busy && (
          <button onClick={remove} style={btn("#FEF2F2", "#DC2626")}><Trash2 size={14} /> Remove</button>
        )}
      </div>
    </div>
  )
}

export default function GroupImagesPage() {
  const { data: session, status } = useSession()
  const role = session?.user?.role ?? ""
  const permitted = role === "ADMIN" || role === "CLUB_LEADER"

  const [groups, setGroups] = useState<G.GroupRef[]>([])
  const [selected, setSelected] = useState("")
  const [images, setImages] = useState<G.GroupImages | null>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (status !== "authenticated" || !permitted) return
    let cancelled = false
    G.listManageable(role)
      .then(list => {
        if (cancelled) return
        setGroups(list)
        setSelected(prev => prev || (list[0] ? `${list[0].kind}:${list[0].id}` : ""))
        if (list.length === 0) setLoading(false)
      })
      .catch(e => { if (!cancelled) { setError(msg(e)); setLoading(false) } })
    return () => { cancelled = true }
  }, [status, permitted, role])

  const group = groups.find(g => `${g.kind}:${g.id}` === selected) ?? null

  useEffect(() => {
    if (!group) return
    let cancelled = false
    G.getImages(group)
      .then(i => { if (!cancelled) setImages(i) })
      .catch(e => { if (!cancelled) setError(msg(e)) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [group, reloadKey])

  if (status === "authenticated" && !permitted) {
    return <MainLayout><p style={{ textAlign: "center", padding: "80px 0", fontSize: 14, color: "#6B6962" }}>Only leaders and administrators can change group images.</p></MainLayout>
  }

  if (!loading && groups.length === 0) {
    return (
      <MainLayout>
        <div style={{ ...card, maxWidth: 520, margin: "60px auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#0B1D3A", marginBottom: 8 }}>No group to manage</h2>
          <p style={{ fontSize: 14, color: "#6B6962", lineHeight: 1.6 }}>{error || "You have not been assigned a club, society or team yet."} If you were just assigned, sign out and in again.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#0B1D3A", marginBottom: 4 }}>Group images</h1>
            <p style={{ fontSize: 14, color: "#6B6962" }}>{group ? group.name : "Logo and banner"}</p>
          </div>
          {groups.length > 1 && (
            <select value={selected} onChange={e => { setSelected(e.target.value); setImages(null) }}
              style={{ width: 260, padding: "10px 12px", fontSize: 14, borderRadius: 10, border: "1.5px solid #E4E2DC", background: "white", fontFamily: "'Inter', sans-serif" }}>
              {groups.map(g => <option key={`${g.kind}:${g.id}`} value={`${g.kind}:${g.id}`}>{g.label}</option>)}
            </select>
          )}
        </div>

        {notice && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", fontSize: 13 }}>{notice}</div>}
        {error && <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", fontSize: 13 }}>{error}</div>}

        {loading || !group || !images ? (
          <p style={{ textAlign: "center", padding: "60px 0", fontSize: 14, color: "#9CA3AF" }}>Loading...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ImageSlot kind="logo" group={group} url={images.logoUrl} onNotice={setNotice} onError={setError} onChanged={() => setReloadKey(k => k + 1)} />
            <ImageSlot kind="banner" group={group} url={images.bannerUrl} onNotice={setNotice} onError={setError} onChanged={() => setReloadKey(k => k + 1)} />
          </div>
        )}
      </div>
    </MainLayout>
  )
}