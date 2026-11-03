import { Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

type Action = 'hide' | 'remove' | 'restore'
type Actor = NonNullable<AuthRequest['user']>

const manages = (u: Actor, a: { clubId: string | null; teamId: string | null }) =>
  u.role === 'ADMIN' ||
  (u.role === 'CLUB_LEADER' &&
    ((!!a.clubId && a.clubId === u.managedClubId) || (!!a.teamId && a.teamId === u.managedTeamId)))

// GET /api/articles/managed: articles you may manage (all for an admin)
export const listManagedArticles = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const where: Prisma.ArticleWhereInput =
      u.role === 'ADMIN'
        ? {}
        : {
            OR: [
              ...(u.managedClubId ? [{ clubId: u.managedClubId }] : []),
              ...(u.managedTeamId ? [{ teamId: u.managedTeamId }] : [])
            ]
          }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true, title: true, status: true, category: true, createdAt: true,
        moderationNote: true, removedByAdmin: true,
        author: { select: { name: true } },
        club: { select: { name: true } },
        team: { select: { name: true } }
      }
    })
    return sendSuccess(res, articles)
  } catch (error) {
    return sendError(res, 'Failed to fetch articles', 500, error)
  }
}

const change = (action: Action) => async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const isAdmin = u.role === 'ADMIN'
    const reason = req.body.reason ? String(req.body.reason).trim().slice(0, 500) : ''

    const article = await prisma.article.findUnique({ where: { id: req.params.id } })
    if (!article) return sendError(res, 'Article not found', 404)
    if (!manages(u, article)) return sendError(res, 'You can only manage articles of your own group', 403)
    if (!isAdmin && article.removedByAdmin) {
      return sendError(res, 'An administrator took this article down. Only an administrator can change it.', 403)
    }

    if (action === 'hide') {
      if (article.status !== 'PUBLISHED') return sendError(res, 'Only a published article can be hidden', 409)
      if (reason.length < 5) return sendError(res, 'Give a short reason.', 400)
    }
    if (action === 'remove') {
      if (article.status === 'REMOVED') return sendError(res, 'This article is already removed', 409)
      if (reason.length < 5) return sendError(res, 'Give a short reason.', 400)
    }
    if (action === 'restore') {
      if (article.status !== 'HIDDEN' && article.status !== 'REMOVED') {
        return sendError(res, 'This article is already published', 409)
      }
      if (article.status === 'REMOVED' && !isAdmin) {
        return sendError(res, 'Only an administrator can restore a removed article', 403)
      }
    }

    const label = action === 'hide' ? 'Article hidden' : action === 'remove' ? 'Article removed' : 'Article restored'

    const ops: Prisma.PrismaPromise<unknown>[] = [
      prisma.article.update({
        where: { id: article.id },
        data:
          action === 'restore'
            ? { status: 'PUBLISHED', moderationNote: null, removedByAdmin: false }
            : { status: action === 'hide' ? 'HIDDEN' : 'REMOVED', moderationNote: reason, removedByAdmin: isAdmin }
      }),
      prisma.auditLog.create({
        data: {
          adminId: u.id,
          action: `${label} by ${isAdmin ? 'administrator' : 'leader'}`,
          targetType: 'Article',
          targetId: article.id,
          details: `${article.title}${reason ? `. Reason: ${reason}` : ''}`
        }
      })
    ]

    // When an admin acts, tell the author and the group's leaders
    if (isAdmin) {
      const leaders = await prisma.user.findMany({
        where: {
          OR: [
            ...(article.clubId ? [{ managedClubId: article.clubId }] : []),
            ...(article.teamId ? [{ managedTeamId: article.teamId }] : [])
          ]
        },
        select: { id: true }
      })
      const ids = new Set([article.authorId, ...leaders.map(l => l.id)])
      ids.delete(u.id)
      if (ids.size) {
        ops.push(prisma.notification.createMany({
          data: Array.from(ids).map(userId => ({
            userId,
            title: label,
            message: action === 'restore'
              ? `An administrator restored "${article.title}".`
              : `An administrator ${action === 'hide' ? 'hid' : 'removed'} "${article.title}". Reason: ${reason}`,
            type: 'news',
            link: '/clubs/manage/news'
          }))
        }))
      }
    }

    await prisma.$transaction(ops)
    return sendSuccess(res, null, label)
  } catch (error) {
    return sendError(res, 'Failed to update the article', 500, error)
  }
}

export const hideArticle = change('hide')
export const removeArticle = change('remove')
export const restoreArticle = change('restore')