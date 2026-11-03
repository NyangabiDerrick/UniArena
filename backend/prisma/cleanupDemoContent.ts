import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const idsText = process.env.ARTICLE_IDS || ""
  const eventText = process.env.EVENT_IDS || ""
  const articleIds = idsText.split(",").map(s => s.trim()).filter(Boolean)
  const eventIds = eventText.split(",").map(s => s.trim()).filter(Boolean)

  const articles = await prisma.article.findMany({
    select: { id: true, title: true, status: true, createdAt: true },
    orderBy: { createdAt: "asc" }
  })
  const events = await prisma.event.findMany({
    select: { id: true, title: true, status: true, startsAt: true, _count: { select: { tickets: true } } },
    orderBy: { createdAt: "asc" }
  })

  console.log("\nARTICLES")
  articles.forEach(a => console.log(`  ${a.id}  [${a.status}]  ${a.title}`))
  console.log("\nEVENTS")
  events.forEach(e => console.log(`  ${e.id}  [${e.status}]  ${e.title}  (${e._count.tickets} tickets)`))

  if (process.env.CONFIRM !== "yes") {
    console.log("\nNothing deleted. To delete, re-run with CONFIRM=yes and the ids you want gone:")
    console.log('  CONFIRM=yes ARTICLE_IDS="id1,id2" EVENT_IDS="id3,id4" npx ts-node prisma/cleanupDemoContent.ts')
    return
  }

  if (articleIds.length === 0 && eventIds.length === 0) {
    console.log("\nNo ids given, so nothing was deleted.")
    return
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { articleId: { in: articleIds } } }),
    prisma.article.deleteMany({ where: { id: { in: articleIds } } }),
    prisma.ticket.deleteMany({ where: { eventId: { in: eventIds } } }),
    prisma.event.deleteMany({ where: { id: { in: eventIds } } })
  ])
  console.log(`\nDeleted ${articleIds.length} articles and ${eventIds.length} events.`)
}

main().finally(() => prisma.$disconnect())