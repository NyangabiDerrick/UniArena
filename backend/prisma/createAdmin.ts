import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD")

  await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { role: "ADMIN", passwordHash: await bcrypt.hash(password, 12), isActive: true },
    create: {
      email: email.toLowerCase(),
      name: process.env.ADMIN_NAME || "Administrator",
      studentId: process.env.ADMIN_STUDENT_ID || "ADMIN-001",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 12)
    }
  })
  console.log("Admin ready:", email)
}

main().finally(() => prisma.$disconnect())