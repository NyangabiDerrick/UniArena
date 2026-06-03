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
    const { title, content, clubId, teamId, isUniversityWide, tags } = req.body

    const user = await prisma.user.findUnique({ where: { email: req.user?.email } })
    if (!user) return sendError(res, 'User not found', 404)

    const article = await prisma.article.create({
      data: {
        title, content,
        authorId: user.id,
        status: 'PENDING',
        isUniversityWide: isUniversityWide ?? false,
        tags: tags ?? [],
        ...(clubId ? { clubId } : {}),
        ...(teamId ? { teamId } : {})
      }
    })

    return sendSuccess(res, article, 'Article submitted for review', 201)
  } catch (error) {
    return sendError(res, 'Failed to create article', 500, error)
  }
}