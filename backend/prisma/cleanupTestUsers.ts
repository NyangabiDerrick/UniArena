import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  if (!adminEmail) throw new Error("Set ADMIN_EMAIL to your real admin account")

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!admin || admin.role !== "ADMIN") throw new Error("ADMIN_EMAIL is not an admin account")

  const testUsers = await prisma.user.findMany({
    where: { passwordHash: null, email: { endsWith: "@university.ac" } },
    select: { id: true, email: true }
  })
  const ids = testUsers.map(u => u.id)

  console.log(`Found ${testUsers.length} test accounts:`)
  testUsers.forEach(u => console.log(" -", u.email))

  if (process.env.CONFIRM !== "yes") {
    console.log("\nDry run only. Re-run with CONFIRM=yes to delete them.")
    return
  }
  if (ids.length === 0) return

  await prisma.$transaction([
    prisma.event.updateMany({ where: { createdBy: { in: ids } }, data: { createdBy: admin.id } }),
    prisma.article.updateMany({ where: { authorId: { in: ids } }, data: { authorId: admin.id } }),
    prisma.auditLog.updateMany({ where: { adminId: { in: ids } }, data: { adminId: admin.id } }),
    prisma.club.updateMany({ where: { advisorId: { in: ids } }, data: { advisorId: null } }),
    prisma.clubMembership.deleteMany({ where: { userId: { in: ids } } }),
    prisma.clubCommittee.deleteMany({ where: { userId: { in: ids } } }),
    prisma.squadMember.deleteMany({ where: { userId: { in: ids } } }),
    prisma.ticket.deleteMany({ where: { userId: { in: ids } } }),
    prisma.comment.deleteMany({ where: { userId: { in: ids } } }),
    prisma.media.deleteMany({ where: { uploadedBy: { in: ids } } }),
    prisma.notification.deleteMany({ where: { userId: { in: ids } } }),
    prisma.message.deleteMany({ where: { OR: [{ senderId: { in: ids } }, { receiverId: { in: ids } }] } }),
    prisma.discussionBoard.deleteMany({ where: { userId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } })
  ])
  console.log(`\nDeleted ${ids.length} test accounts. Their events and articles now belong to ${admin.email}.`)
}

main().finally(() => prisma.$disconnect())