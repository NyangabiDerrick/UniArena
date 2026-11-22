import type { Ticket } from "./ticketTypes"

const NAVY: [number, number, number] = [11, 29, 58]
const GOLD: [number, number, number] = [201, 168, 76]
const GREY: [number, number, number] = [107, 105, 98]

const longDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
const clock = (d: string) =>
  new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

const fileSafe = (s: string) => s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-$/, "").toLowerCase() || "event"

// Builds a one-page PDF ticket with a QR code of the ticket code and saves it.
// The PDF libraries are loaded on demand so they don't weigh down every page.
export async function downloadTicketPdf(ticket: Ticket, holder?: string | null) {
  const [{ jsPDF }, QRCode] = await Promise.all([import("jspdf"), import("qrcode")])
  const qr = await QRCode.toDataURL(ticket.qrCode, { margin: 1, width: 400, errorCorrectionLevel: "M" })

  const doc = new jsPDF({ unit: "mm", format: [105, 165] })
  const w = doc.internal.pageSize.getWidth()
  const margin = 10

  doc.setFillColor(...NAVY)
  doc.rect(0, 0, w, 24, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("UniArena", margin, 15)
  doc.setTextColor(...GOLD)
  doc.setFontSize(9)
  doc.text("EVENT TICKET", w - margin, 15, { align: "right" })

  doc.setTextColor(...NAVY)
  doc.setFontSize(15)
  const title = doc.splitTextToSize(ticket.event.title, w - margin * 2) as string[]
  const shown = title.slice(0, 3)
  if (title.length > 3) shown[2] = `${shown[2].replace(/\s+\S*$/, "")}...`
  doc.text(shown, margin, 36)
  let y = 36 + Math.min(title.length, 3) * 6.5 + 2

  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...GREY)
    doc.text(label.toUpperCase(), margin, y)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(...NAVY)
    const lines = doc.splitTextToSize(value, w - margin * 2) as string[]
    doc.text(lines, margin, y + 4.5)
    y += 4.5 + lines.length * 4.6 + 3
  }

  row("Date", longDate(ticket.event.startsAt))
  row("Time", `${clock(ticket.event.startsAt)} – ${clock(ticket.event.endsAt)}`)
  row("Venue", ticket.event.venue)
  if (holder) row("Ticket holder", holder)

  const size = 38
  doc.addImage(qr, "PNG", (w - size) / 2, y + 1, size, size)
  y += size + 6
  doc.setFont("courier", "bold")
  doc.setFontSize(13)
  doc.setTextColor(...NAVY)
  doc.text(ticket.qrCode, w / 2, y, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(...GREY)
  doc.text("Show this code at the entrance. One ticket admits one person.", w / 2, y + 5, { align: "center" })

  doc.save(`uniarena-ticket-${fileSafe(ticket.event.title)}-${ticket.qrCode}.pdf`)
}
