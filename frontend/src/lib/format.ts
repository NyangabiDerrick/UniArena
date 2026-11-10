import type { Article, Event } from "./types"

// Flat price the backend charges for a paid ticket (kept for older imports)
export const PAID_TICKET_PRICE = 5

type WithCategory = { category?: string | null }

// "SPORTS" -> "Sports"
export const categoryLabel = (key: string) =>
  key ? key.charAt(0).toUpperCase() + key.slice(1).toLowerCase() : ""

// Returns the stored category in upper case: SOCIAL, CLUB, SPORTS, UNIVERSITY or ACADEMIC.
// Old rows without one fall back to a guess from the club or team.
export const eventCategory = (e: Event): string => {
  const stored = (e as WithCategory).category
  if (stored) return stored.toUpperCase()
  if (e.team) return "SPORTS"
  if (e.club) return "CLUB"
  return "UNIVERSITY"
}

// Returns CLUB, SPORTS or UNIVERSITY
export const articleCategory = (a: Article): string => {
  const stored = (a as WithCategory).category
  if (stored) return stored.toUpperCase()
  if (a.team) return "SPORTS"
  if (a.club) return "CLUB"
  return "UNIVERSITY"
}

export const eventSold = (e: Event) => e.sold ?? e._count?.tickets ?? 0

export const formatEventDate = (e: Event) =>
  e.date || (e.startsAt ? new Date(e.startsAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "")

export const formatEventTime = (e: Event) =>
  e.time || (e.startsAt ? new Date(e.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "")