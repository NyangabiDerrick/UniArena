import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// POST /api/articles/:id/comments: published straight away, removable through a report
export const postComment = async (req: AuthRequest, res: Response) => {
  try {
    const content = String(req.body.content).trim()
    if (!content || content.length > 1000) return sendError(res, 'A comment must be 1 to 1000 characters', 400)

    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      select: { id: true, status: true }
    })
    if (!article || article.status !== 'PUBLISHED') return sendError(res, 'Article not found', 404)

    const comment = await prisma.comment.create({
      data: { articleId: article.id, userId: req.user!.id, content, isApproved: true },
      include: { user: { select: { name: true } } }
    })

    return sendSuccess(res, comment, 'Comment posted', 201)
  } catch (error) {
    return sendError(res, 'Failed to post comment', 500, error)
  }
}

// POST /api/comments/:id/report { reason, details? }
export const reportComment = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!

    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true } },
        article: { select: { title: true } }
      }
    })
    if (!comment || !comment.isApproved) return sendError(res, 'Comment not found', 404)
    if (comment.userId === me.id) return sendError(res, "You can't report your own comment", 400)

    const open = await prisma.messageReport.findFirst({
      where: { reporterId: me.id, targetType: 'COMMENT', targetId: comment.id, status: 'OPEN' }
    })
    if (open) return sendError(res, 'You already reported this comment. An administrator will review it.', 409)

    const evidence = JSON.stringify([{
      from: 'reported',
      content: comment.content,
      sentAt: comment.createdAt,
      context: `Comment on the article "${comment.article.title}"`
    }])

    await prisma.messageReport.create({
      data: {
        reporterId: me.id,
        reportedId: comment.userId,
        targetType: 'COMMENT',
        targetId: comment.id,
        reason: String(req.body.reason),
        details: req.body.details ? String(req.body.details).slice(0, 1000) : null,
        evidence
      }
    })

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { id: true } })
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          title: 'New comment report',
          message: `A comment by ${comment.user.name} was reported. Please review it.`,
          type: 'default',
          link: '/admin/reports'
        }))
      })
    }

    return sendSuccess(res, null, 'Report sent. An administrator will review it.', 201)
  } catch (error) {
    return sendError(res, 'Failed to send report', 500, error)
  }
}