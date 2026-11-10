import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

type Actor = NonNullable<AuthRequest['user']>

// Active members, the club's own leader, and admins can read and post
const canAccess = async (u: Actor, clubId: string) => {
  if (u.role === 'ADMIN') return true
  if (u.role === 'CLUB_LEADER' && u.managedClubId === clubId) return true
  const m = await prisma.clubMembership.findUnique({
    where: { userId_clubId: { userId: u.id, clubId } }
  })
  return m?.status === 'ACTIVE'
}

// Only the club's leader and admins can pin or moderate
const canModerate = (u: Actor, clubId: string) =>
  u.role === 'ADMIN' || (u.role === 'CLUB_LEADER' && u.managedClubId === clubId)

// GET /api/clubs/:id/discussions
export const listDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const clubId = req.params.id
    if (!(await canAccess(u, clubId))) {
      return sendError(res, 'Only members of this club can read its discussions', 403)
    }

    const posts = await prisma.discussionBoard.findMany({
      where: { clubId },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      select: {
        id: true, title: true, content: true, isPinned: true, createdAt: true, userId: true,
        user: { select: { name: true } }
      }
    })

    return sendSuccess(res, {
      canModerate: canModerate(u, clubId),
      posts
    })
  } catch (error) {
    return sendError(res, 'Failed to load discussions', 500, error)
  }
}

// POST /api/clubs/:id/discussions { title, content }
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const clubId = req.params.id
    if (!(await canAccess(u, clubId))) {
      return sendError(res, 'Only members of this club can post here', 403)
    }

    const title = String(req.body.title ?? '').trim()
    const content = String(req.body.content ?? '').trim()
    if (title.length < 2 || title.length > 120) return sendError(res, 'The title must be 2 to 120 characters', 400)
    if (content.length < 1 || content.length > 2000) return sendError(res, 'The message must be 1 to 2000 characters', 400)

    const post = await prisma.discussionBoard.create({
      data: { clubId, userId: u.id, title, content },
      select: {
        id: true, title: true, content: true, isPinned: true, createdAt: true, userId: true,
        user: { select: { name: true } }
      }
    })

    return sendSuccess(res, post, 'Posted', 201)
  } catch (error) {
    return sendError(res, 'Failed to post', 500, error)
  }
}

// PUT /api/clubs/:id/discussions/:postId/pin (toggles)
export const togglePin = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const clubId = req.params.id
    if (!canModerate(u, clubId)) return sendError(res, 'Only the club leader or an administrator can pin posts', 403)

    const post = await prisma.discussionBoard.findFirst({ where: { id: req.params.postId, clubId } })
    if (!post) return sendError(res, 'Post not found', 404)

    await prisma.discussionBoard.update({ where: { id: post.id }, data: { isPinned: !post.isPinned } })
    return sendSuccess(res, null, post.isPinned ? 'Post unpinned' : 'Post pinned')
  } catch (error) {
    return sendError(res, 'Failed to update the post', 500, error)
  }
}

// DELETE /api/clubs/:id/discussions/:postId (author, leader or admin)
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const clubId = req.params.id

    const post = await prisma.discussionBoard.findFirst({ where: { id: req.params.postId, clubId } })
    if (!post) return sendError(res, 'Post not found', 404)
    if (post.userId !== u.id && !canModerate(u, clubId)) {
      return sendError(res, 'You can only delete your own posts', 403)
    }

    await prisma.discussionBoard.delete({ where: { id: post.id } })
    return sendSuccess(res, null, 'Post deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete the post', 500, error)
  }
}