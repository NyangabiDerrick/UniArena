import type { Article, Event } from "./types"

// Flat price the backend charges for a paid ticket
export const PAID_TICKET_PRICE = 5

export const eventCategory = (e: Event) => {
  if (e.category) return e.category
  if (e.team) return "Sports"
  if (e.club) return "Club"
  return "University"
}

export const eventSold = (e: Event) => e.sold ?? e._count?.tickets ?? 0

export const formatEventDate = (e: Event) =>
  e.date || (e.startsAt ? new Date(e.startsAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "")

export const formatEventTime = (e: Event) =>
  e.time || (e.startsAt ? new Date(e.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "")

export const articleCategory = (a: Article) => {
  if (a.team) return "Sports"
  if (a.club) return "Clubs"
  if (a.isUniversityWide) return "University"
  return "General"
}
