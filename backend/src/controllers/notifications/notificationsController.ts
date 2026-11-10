import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// GET /api/notifications: your own notifications, newest first
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ])
    return sendSuccess(res, { items, unreadCount })
  } catch (error) {
    return sendError(res, 'Failed to fetch notifications', 500, error)
  }
}

// PUT /api/notifications/read-all
export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true }
    })
    return sendSuccess(res, null, 'All notifications marked as read')
  } catch (error) {
    return sendError(res, 'Failed to update notifications', 500, error)
  }
}

// PUT /api/notifications/:id/read: only your own
export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true }
    })
    if (result.count === 0) return sendError(res, 'Notification not found', 404)
    return sendSuccess(res, null, 'Marked as read')
  } catch (error) {
    return sendError(res, 'Failed to update notification', 500, error)
  }
}