import { Request, Response } from 'express'
import { ArticleCategory } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// What each kind of creator may choose. The form shows these, and the server enforces them.
const allowedArticleCategories = (role: string, hasClub: boolean, hasTeam: boolean): ArticleCategory[] => {
  if (role === 'ADMIN') return ['CLUB', 'SPORTS', 'UNIVERSITY']
  if (hasTeam) return ['SPORTS']
  if (hasClub) return ['CLUB']
  return []
}

// GET /api/articles (public): published articles, pinned first
export const getArticles = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query
    const categoryFilter =
      category === 'CLUB' || category === 'SPORTS' || category === 'UNIVERSITY'
        ? { category: category as ArticleCategory }
        : {}

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        ...categoryFilter,
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

// GET /api/articles/categories: the categories the signed-in person may use
export const getArticleCategories = async (req: AuthRequest, res: Response) => {
  const u = req.user!
  return sendSuccess(res, allowedArticleCategories(u.role, !!u.managedClubId, !!u.managedTeamId))
}

// GET /api/articles/:id (public): one article with its visible comments
export const getArticleById = async (req: Request, res: Response) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { name: true } },
        club: { select: { name: true } },
        team: { select: { name: true } },
        comments: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!article || article.status !== 'PUBLISHED') return sendError(res, 'Article not found', 404)
    return sendSuccess(res, article)
  } catch (error) {
    return sendError(res, 'Failed to fetch article', 500, error)
  }
}

// POST /api/articles (leader for their own group, or admin)
export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const { title, content } = req.body
    const category = req.body.category as ArticleCategory
    const tags: string[] = Array.isArray(req.body.tags)
      ? req.body.tags.map((t: unknown) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 8)
      : []

    let clubId: string | undefined
    let teamId: string | undefined
    if (u.role === 'CLUB_LEADER') {
      clubId = u.managedClubId ?? undefined
      teamId = u.managedTeamId ?? undefined
      if (!clubId && !teamId) return sendError(res, 'You are not assigned to a club or team yet', 403)
    } else {
      clubId = req.body.clubId || undefined
      teamId = req.body.teamId || undefined
    }

    const allowed = allowedArticleCategories(u.role, !!clubId, !!teamId)
    if (!allowed.includes(category)) {
      return sendError(res, `You can't post ${String(category).toLowerCase()} news. Allowed: ${allowed.join(', ')}`, 403)
    }

    const article = await prisma.article.create({
      data: {
        title, content, tags, category,
        authorId: u.id,
        status: u.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING',
        isUniversityWide: category === 'UNIVERSITY',
        ...(clubId ? { clubId } : {}),
        ...(teamId ? { teamId } : {})
      }
    })

    return sendSuccess(res, article, u.role === 'ADMIN' ? 'Article published' : 'Article submitted for approval', 201)
  } catch (error) {
    return sendError(res, 'Failed to create article', 500, error)
  }
}