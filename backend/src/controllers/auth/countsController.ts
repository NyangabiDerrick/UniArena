import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// GET /api/counts: both navbar badges, plus whether the email is confirmed
export const getCounts = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!.id
    const blocked = (
      await prisma.userBlock.findMany({ where: { blockerId: me }, select: { blockedId: true } })
    ).map(b => b.blockedId)

    const [notifications, messages, account] = await Promise.all([
      prisma.notification.count({ where: { userId: me, isRead: false } }),
      prisma.message.count({ where: { receiverId: me, isRead: false, senderId: { notIn: blocked } } }),
      prisma.user.findUnique({ where: { id: me }, select: { emailVerified: true } })
    ])

    return sendSuccess(res, { notifications, messages, emailVerified: account?.emailVerified ?? false })
  } catch (error) {
    return sendError(res, 'Failed to fetch counts', 500, error)
  }
}