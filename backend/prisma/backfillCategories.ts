import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const e1 = await prisma.event.updateMany({ where: { clubId: { not: null } }, data: { category: "CLUB" } })
  const e2 = await prisma.event.updateMany({ where: { teamId: { not: null } }, data: { category: "SPORTS" } })
  const e3 = await prisma.event.updateMany({ where: { clubId: null, teamId: null }, data: { category: "UNIVERSITY" } })

  const a1 = await prisma.article.updateMany({ where: { clubId: { not: null } }, data: { category: "CLUB" } })
  const a2 = await prisma.article.updateMany({ where: { teamId: { not: null } }, data: { category: "SPORTS" } })
  const a3 = await prisma.article.updateMany({ where: { clubId: null, teamId: null }, data: { category: "UNIVERSITY" } })

  console.log(`Events: ${e1.count} club, ${e2.count} sports, ${e3.count} university`)
  console.log(`Articles: ${a1.count} club, ${a2.count} sports, ${a3.count} university`)
}

main().finally(() => prisma.$disconnect())