import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const r = await prisma.article.updateMany({ where: { status: "PENDING" }, data: { status: "PUBLISHED" } })
  console.log(`Published ${r.count} pending articles`)
}

main().finally(() => prisma.$disconnect())