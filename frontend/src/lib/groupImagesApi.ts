import { getSession } from "next-auth/react"

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export type ImageKind = "logo" | "banner"

export interface GroupRef {
  kind: "club" | "team"
  id: string
  name: string
  label: string
}

export interface GroupImages {
  logoUrl: string | null
  bannerUrl: string | null
}

// Stored paths like /uploads/clubs/x.webp become full addresses
export const imageSrc = (url?: string | null): string | null =>
  !url ? null : url.startsWith("http") ? url : `${API_URL}${url}`

const plural = (g: Pick<GroupRef, "kind">) => (g.kind === "club" ? "clubs" : "teams")

async function authed(path: string, init: RequestInit = {}) {
  const session = await getSession()
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {})
    }
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Request failed")
  return json as { data: unknown; message: string }
}

interface NamedId { id: string; name: string; type?: string }

// Admins can change any group. Leaders only the one they lead.
export async function listManageable(role: string): Promise<GroupRef[]> {
  if (role === "ADMIN") {
    const { data } = await authed("/api/admin/groups")
    const d = data as { clubs: NamedId[]; teams: NamedId[] }
    return [
      ...d.clubs.map(c => ({ kind: "club" as const, id: c.id, name: c.name, label: `${c.name} (${c.type === "SOCIETY" ? "society" : "club"})` })),
      ...d.teams.map(t => ({ kind: "team" as const, id: t.id, name: t.name, label: `${t.name} (team)` }))
    ]
  }
  const { data } = await authed("/api/users/profile")
  const p = data as { managedClub?: NamedId | null; managedTeam?: NamedId | null }
  const out: GroupRef[] = []
  if (p.managedClub) out.push({ kind: "club", id: p.managedClub.id, name: p.managedClub.name, label: p.managedClub.name })
  if (p.managedTeam) out.push({ kind: "team", id: p.managedTeam.id, name: p.managedTeam.name, label: p.managedTeam.name })
  return out
}

export async function getImages(g: GroupRef): Promise<GroupImages> {
  const res = await fetch(`${API_URL}/api/${g.kind === "club" ? "clubs" : "sports"}/${g.id}`)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || "Could not load the group")
  return { logoUrl: json.data.logoUrl ?? null, bannerUrl: json.data.bannerUrl ?? null }
}

export async function uploadImage(g: GroupRef, kind: ImageKind, file: File): Promise<string> {
  const form = new FormData()
  form.append("image", file)
  return (await authed(`/api/groups/${plural(g)}/${g.id}/${kind}`, { method: "POST", body: form })).message
}

export async function removeImage(g: GroupRef, kind: ImageKind): Promise<string> {
  return (await authed(`/api/groups/${plural(g)}/${g.id}/${kind}`, { method: "DELETE" })).message
}