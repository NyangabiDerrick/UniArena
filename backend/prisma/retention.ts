import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Deletes data UniArena no longer needs to keep. Dry run unless CONFIRM=yes.
// Schedule it (for example weekly) once the rules below match the published Data Policy.
//   MESSAGE_RETENTION_DAYS       messages older than this are deleted (default 365)
//   NOTIFICATION_RETENTION_DAYS  read notifications older than this are deleted (default 90)
const days = (name: string, fallback: number) => Math.max(1, Number(process.env[name]) || fallback)
const ago = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000)

async function main() {
  const messageCutoff = ago(days("MESSAGE_RETENTION_DAYS", 365))
  const notificationCutoff = ago(days("NOTIFICATION_RETENTION_DAYS", 90))
  const now = new Date()

  const counts = {
    messages: await prisma.message.count({ where: { sentAt: { lt: messageCutoff } } }),
    notifications: await prisma.notification.count({ where: { isRead: true, createdAt: { lt: notificationCutoff } } }),
    expiredResetTokens: await prisma.user.count({ where: { resetTokenExpiry: { lt: now } } }),
    expiredVerifyTokens: await prisma.user.count({ where: { verifyTokenExpiry: { lt: now } } })
  }

  console.log(`Messages older than ${messageCutoff.toISOString().slice(0, 10)}: ${counts.messages}`)
  console.log(`Read notifications older than ${notificationCutoff.toISOString().slice(0, 10)}: ${counts.notifications}`)
  console.log(`Expired password-reset tokens: ${counts.expiredResetTokens}, expired confirmation tokens: ${counts.expiredVerifyTokens}`)

  if (process.env.CONFIRM !== "yes") {
    console.log("\nNothing deleted. Re-run with CONFIRM=yes to apply.")
    return
  }

  await prisma.$transaction([
    prisma.message.deleteMany({ where: { sentAt: { lt: messageCutoff } } }),
    prisma.notification.deleteMany({ where: { isRead: true, createdAt: { lt: notificationCutoff } } }),
    prisma.user.updateMany({ where: { resetTokenExpiry: { lt: now } }, data: { resetToken: null, resetTokenExpiry: null } }),
    prisma.user.updateMany({ where: { verifyTokenExpiry: { lt: now } }, data: { verifyToken: null, verifyTokenExpiry: null } })
  ])
  console.log("\nDone.")
}

main().finally(() => prisma.$disconnect())
