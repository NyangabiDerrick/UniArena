import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

type Kind = 'EVENT' | 'ARTICLE'

interface Target {
  id: string
  ownerId: string
  title: string
  body: string
  createdAt: Date
}

const fileReport = async (req: AuthRequest, res: Response, kind: Kind, target: Target) => {
  const me = req.user!
  const noun = kind === 'EVENT' ? 'event' : 'article'

  if (target.ownerId === me.id) return sendError(res, `You can't report your own ${noun}`, 400)

  const open = await prisma.messageReport.findFirst({
    where: { reporterId: me.id, targetType: kind, targetId: target.id, status: 'OPEN' }
  })
  if (open) return sendError(res, `You already reported this ${noun}. An administrator will review it.`, 409)

  const owner = await prisma.user.findUnique({ where: { id: target.ownerId }, select: { name: true } })

  const evidence = JSON.stringify([{
    from: 'reported',
    content: `${target.title}\n\n${target.body}`.slice(0, 1500),
    sentAt: target.createdAt,
    context: `The ${noun} "${target.title}"`
  }])

  await prisma.messageReport.create({
    data: {
      reporterId: me.id,
      reportedId: target.ownerId,
      targetType: kind,
      targetId: target.id,
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
        title: `New ${noun} report`,
        message: `The ${noun} "${target.title}" by ${owner?.name ?? 'someone'} was reported. Please review it.`,
        type: 'default',
        link: '/admin/reports'
      }))
    })
  }

  return sendSuccess(res, null, 'Report sent. An administrator will review it.', 201)
}

// POST /api/events/:id/report { reason, details? }
export const reportEvent = async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } })
    if (!event || (event.status !== 'APPROVED' && event.status !== 'CANCELLED')) {
      return sendError(res, 'Event not found', 404)
    }
    return await fileReport(req, res, 'EVENT', {
      id: event.id, ownerId: event.createdBy, title: event.title,
      body: event.description ?? '', createdAt: event.createdAt
    })
  } catch (error) {
    return sendError(res, 'Failed to send report', 500, error)
  }
}

// POST /api/articles/:id/report { reason, details? }
export const reportArticle = async (req: AuthRequest, res: Response) => {
  try {
    const article = await prisma.article.findUnique({ where: { id: req.params.id } })
    if (!article || article.status !== 'PUBLISHED') return sendError(res, 'Article not found', 404)
    return await fileReport(req, res, 'ARTICLE', {
      id: article.id, ownerId: article.authorId, title: article.title,
      body: article.content, createdAt: article.createdAt
    })
  } catch (error) {
    return sendError(res, 'Failed to send report', 500, error)
  }
}