export interface Ticket {
  id: string
  qrCode: string
  purchasedAt: string
  event: {
    id: string
    title: string
    venue: string
    startsAt: string
    endsAt: string
  }
}