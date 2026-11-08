import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Removes ONE account and hands its records to the admin who runs this.
// Dry run unless CONFIRM=yes. Requires TARGET_EMAIL and ADMIN_EMAIL.
async function main() {
  const targetEmail = process.env.TARGET_EMAIL?.trim().toLowerCase()
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!targetEmail || !adminEmail) throw new Error("Set TARGET_EMAIL and ADMIN_EMAIL")
  if (targetEmail === adminEmail) throw new Error("The target and the admin cannot be the same account")

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!admin || admin.role !== "ADMIN") throw new Error("ADMIN_EMAIL must be an active admin account")

  const target = await prisma.user.findUnique({ where: { email: targetEmail } })
  if (!target) throw new Error(`No account with email ${targetEmail}`)
  if (target.role === "ADMIN") {
    const otherAdmins = await prisma.user.count({ where: { role: "ADMIN", NOT: { id: target.id } } })
    if (otherAdmins === 0) throw new Error("Refusing to remove the last remaining admin")
  }

  const id = target.id
  const counts = {
    eventsReassigned: await prisma.event.count({ where: { createdBy: id } }),
    articlesReassigned: await prisma.article.count({ where: { authorId: id } }),
    auditEntriesReassigned: await prisma.auditLog.count({ where: { adminId: id } }),
    warningsIssued: await prisma.warning.count({ where: { issuedById: id } }),
    reportsAgainst: await prisma.messageReport.count({ where: { reportedId: id } }),
    reportsFiled: await prisma.messageReport.count({ where: { reporterId: id } }),
    tickets: await prisma.ticket.count({ where: { userId: id } }),
    messages: await prisma.message.count({ where: { OR: [{ senderId: id }, { receiverId: id }] } })
  }

  console.log(`\nAccount: ${target.name} <${target.email}> (${target.role})`)
  console.log(`Records that will be reassigned to ${admin.name} <${admin.email}>:`)
  console.log(`  events ${counts.eventsReassigned}, articles ${counts.articlesReassigned}, audit entries ${counts.auditEntriesReassigned}, warnings issued ${counts.warningsIssued}`)
  console.log(`Records that will be permanently deleted:`)
  console.log(`  reports against ${counts.reportsAgainst}, reports filed ${counts.reportsFiled}, tickets ${counts.tickets}, messages ${counts.messages}`)

  if (process.env.CONFIRM !== "yes") {
    console.log("\nNothing changed. To remove this account, re-run with CONFIRM=yes.")
    return
  }

  await prisma.$transaction([
    prisma.event.updateMany({ where: { createdBy: id }, data: { createdBy: admin.id } }),
    prisma.article.updateMany({ where: { authorId: id }, data: { authorId: admin.id } }),
    prisma.auditLog.updateMany({ where: { adminId: id }, data: { adminId: admin.id } }),
    prisma.warning.updateMany({ where: { issuedById: id }, data: { issuedById: admin.id } }),
    prisma.appeal.updateMany({ where: { decidedById: id }, data: { decidedById: null } }),
    prisma.messageReport.updateMany({ where: { resolvedById: id }, data: { resolvedById: null } }),
    prisma.club.updateMany({ where: { advisorId: id }, data: { advisorId: null } }),
    prisma.messageReport.deleteMany({ where: { OR: [{ reporterId: id }, { reportedId: id }] } }),
    prisma.warning.deleteMany({ where: { userId: id } }),
    prisma.appeal.deleteMany({ where: { userId: id } }),
    prisma.userBlock.deleteMany({ where: { OR: [{ blockerId: id }, { blockedId: id }] } }),
    prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } }),
    prisma.comment.deleteMany({ where: { userId: id } }),
    prisma.ticket.deleteMany({ where: { userId: id } }),
    prisma.media.deleteMany({ where: { uploadedBy: id } }),
    prisma.notification.deleteMany({ where: { userId: id } }),
    prisma.discussionBoard.deleteMany({ where: { userId: id } }),
    prisma.clubMembership.deleteMany({ where: { userId: id } }),
    prisma.clubCommittee.deleteMany({ where: { userId: id } }),
    prisma.squadMember.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } })
  ])

  console.log(`\nRemoved ${target.name} <${target.email}>. Their events, articles and audit entries now belong to ${admin.name}.`)
}

main().finally(() => prisma.$disconnect())