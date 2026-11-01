import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'

const COOLDOWN_DAYS = 7

// POST /api/appeals { email, password, message }
// Public, because a suspended person cannot sign in. The password proves the account is theirs.
export const submitAppeal = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email).trim().toLowerCase()
    const message = String(req.body.message).trim()

    const user = await prisma.user.findUnique({ where: { email } })
    const valid = user?.passwordHash && (await bcrypt.compare(String(req.body.password), user.passwordHash))
    if (!user || !valid) return sendError(res, 'Invalid email or password', 401)

    if (user.isActive) {
      return sendError(res, 'Your account is not suspended. You can sign in normally.', 400)
    }

    const latest = await prisma.appeal.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    if (latest?.status === 'OPEN') {
      return sendError(res, 'You already have an appeal waiting for review. Please be patient.', 409)
    }

    if (latest?.status === 'REJECTED' && latest.decidedAt) {
      const waitedMs = Date.now() - latest.decidedAt.getTime()
      if (waitedMs < COOLDOWN_DAYS * 24 * 60 * 60 * 1000) {
        const reason = latest.decision ? ` Reason given: ${latest.decision}` : ''
        return sendError(res, `Your last appeal was declined.${reason} You can appeal again ${COOLDOWN_DAYS} days after that decision.`, 400)
      }
    }

    await prisma.appeal.create({ data: { userId: user.id, message } })

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { id: true } })
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          title: 'New suspension appeal',
          message: `${user.name} has appealed their suspension.`,
          type: 'default',
          link: '/admin/appeals'
        }))
      })
    }

    return sendSuccess(res, null, 'Appeal sent. An administrator will review it.', 201)
  } catch (error) {
    return sendError(res, 'Failed to send appeal', 500, error)
  }
}