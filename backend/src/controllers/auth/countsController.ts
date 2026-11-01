import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// GET /api/counts: both navbar badges in one request
export const getCounts = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!.id
    const blocked = (
      await prisma.userBlock.findMany({ where: { blockerId: me }, select: { blockedId: true } })
    ).map(b => b.blockedId)

    const [notifications, messages] = await Promise.all([
      prisma.notification.count({ where: { userId: me, isRead: false } }),
      prisma.message.count({ where: { receiverId: me, isRead: false, senderId: { notIn: blocked } } })
    ])

    return sendSuccess(res, { notifications, messages })
  } catch (error) {
    return sendError(res, 'Failed to fetch counts', 500, error)
  }
}