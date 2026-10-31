import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// GET /api/articles
export const getArticles = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        ...(search ? {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' } },
            { content: { contains: String(search), mode: 'insensitive' } }
          ]
        } : {})
      },
      include: {
        author: { select: { name: true } },
        club: { select: { name: true } },
        team: { select: { name: true } }
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
    })

    return sendSuccess(res, articles)
  } catch (error) {
    return sendError(res, 'Failed to fetch articles', 500, error)
  }
}

// GET /api/articles/:id
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { name: true } },
        club: { select: { name: true } },
        comments: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!article) return sendError(res, 'Article not found', 404)
    return sendSuccess(res, article)
  } catch (error) {
    return sendError(res, 'Failed to fetch article', 500, error)
  }
}

// POST /api/articles
export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const { title, content, tags } = req.body

    let clubId: string | undefined
    let teamId: string | undefined
    let isUniversityWide = false
    if (u.role === 'CLUB_LEADER') {
      clubId = u.managedClubId ?? undefined
      teamId = u.managedTeamId ?? undefined
      if (!clubId && !teamId) return sendError(res, 'You are not assigned to a club or team yet', 403)
    } else {
      clubId = req.body.clubId || undefined
      teamId = req.body.teamId || undefined
      isUniversityWide = req.body.isUniversityWide ?? false
    }

    const article = await prisma.article.create({
      data: {
        title, content,
        authorId: u.id,
        status: u.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING',
        isUniversityWide,
        tags: tags ?? [],
        ...(clubId ? { clubId } : {}),
        ...(teamId ? { teamId } : {})
      }
    })

    return sendSuccess(res, article, u.role === 'ADMIN' ? 'Article published' : 'Article submitted for review', 201)
  } catch (error) {
    return sendError(res, 'Failed to create article', 500, error)
  }
}