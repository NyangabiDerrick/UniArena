import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  if (!admin) throw new Error("No admin account found")

  const start = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)

  const base = {
    startsAt: start,
    endsAt: end,
    status: "APPROVED" as const,
    createdBy: admin.id
  }

  await prisma.event.upsert({
    where: { id: "test-free-event" },
    update: { startsAt: start, endsAt: end },
    create: {
      id: "test-free-event", title: "TEST Free Meetup", venue: "Student Union Hall",
      description: "Test event for RSVP checks.", capacity: 3, isFree: true, ...base
    }
  })

  await prisma.event.upsert({
    where: { id: "test-paid-event" },
    update: { startsAt: start, endsAt: end },
    create: {
      id: "test-paid-event", title: "TEST Paid Concert", venue: "Main Hall",
      description: "Test event: paid tickets are disabled.", capacity: 50, isFree: false, ...base
    }
  })

  console.log("Test events ready: test-free-event, test-paid-event")
}

main().finally(() => prisma.$disconnect())