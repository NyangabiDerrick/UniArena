import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// GET /api/clubs: all active clubs and societies (public)
export const getClubs = async (req: Request, res: Response) => {
  try {
    const { category, search, type } = req.query
    const typeFilter = type === 'CLUB' || type === 'SOCIETY' ? { type } : {}

    const clubs = await prisma.club.findMany({
      where: {
        status: 'ACTIVE',
        ...typeFilter,
        ...(category && category !== 'All' ? { category: String(category) } : {}),
        ...(search ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } }
          ]
        } : {})
      },
      include: {
        _count: { select: { memberships: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return sendSuccess(res, clubs)
  } catch (error) {
    return sendError(res, 'Failed to fetch clubs', 500, error)
  }
}

// GET /api/clubs/:id: one club (public, so no emails are exposed)
export const getClubById = async (req: Request, res: Response) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: req.params.id },
      include: {
        committees: {
          include: { user: { select: { name: true } } }
        },
        memberships: {
          where: { status: 'ACTIVE' },
          include: { user: { select: { name: true, faculty: true } } },
          take: 10
        },
        events: {
          where: { status: 'APPROVED' },
          orderBy: { startsAt: 'asc' },
          take: 5
        },
        _count: { select: { memberships: true } }
      }
    })

    if (!club) return sendError(res, 'Club not found', 404)
    return sendSuccess(res, club)
  } catch (error) {
    return sendError(res, 'Failed to fetch club', 500, error)
  }
}

// POST /api/clubs: request a new club (starts as PENDING)
export const createClub = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category } = req.body

    const existing = await prisma.club.findUnique({ where: { name } })
    if (existing) return sendError(res, 'A club with this name already exists', 409)

    const club = await prisma.club.create({
      data: {
        name,
        description,
        category,
        status: 'PENDING'
      }
    })

    return sendSuccess(res, club, 'Club creation request submitted successfully', 201)
  } catch (error) {
    return sendError(res, 'Failed to create club', 500, error)
  }
}

// POST /api/clubs/:id/join: student asks to join
export const joinClub = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const club = await prisma.club.findUnique({ where: { id } })
    if (!club) return sendError(res, 'Club not found', 404)
    if (club.status !== 'ACTIVE') return sendError(res, 'This club is not accepting members', 400)

    const existing = await prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId, clubId: id } }
    })
    if (existing) return sendError(res, 'You have already requested or joined this club', 409)

    const membership = await prisma.clubMembership.create({
      data: { userId, clubId: id, status: 'PENDING' }
    })

    return sendSuccess(res, membership, 'Join request submitted successfully', 201)
  } catch (error) {
    return sendError(res, 'Failed to join club', 500, error)
  }
}

// GET /api/clubs/:id/members: only that club's leader or an admin (enforced in the route)
export const getClubMembers = async (req: Request, res: Response) => {
  try {
    const members = await prisma.clubMembership.findMany({
      where: { clubId: req.params.id },
      include: {
        user: { select: { id: true, name: true, email: true, faculty: true, studentId: true } }
      },
      orderBy: { joinedAt: 'desc' }
    })

    return sendSuccess(res, members)
  } catch (error) {
    return sendError(res, 'Failed to fetch members', 500, error)
  }
}

// PUT /api/clubs/:id/members/:userId: approve, reject or ban (leader or admin)
export const updateMembership = async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params
    const { status } = req.body

    const current = await prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId, clubId: id } }
    })
    if (!current) return sendError(res, 'Membership not found', 404)

    const membership = await prisma.clubMembership.update({
      where: { userId_clubId: { userId, clubId: id } },
      data: { status }
    })

    // Keep the member count right: only count a person when they become ACTIVE
    // or stop being ACTIVE, never twice for the same change.
    if (status === 'ACTIVE' && current.status !== 'ACTIVE') {
      await prisma.club.update({ where: { id }, data: { memberCount: { increment: 1 } } })
    } else if (status !== 'ACTIVE' && current.status === 'ACTIVE') {
      await prisma.club.update({ where: { id }, data: { memberCount: { decrement: 1 } } })
    }

    return sendSuccess(res, membership, `Membership ${String(status).toLowerCase()}`)
  } catch (error) {
    return sendError(res, 'Failed to update membership', 500, error)
  }
}

// GET /api/clubs/mine: the club or society the signed-in leader manages
export const getMyClub = async (req: AuthRequest, res: Response) => {
  try {
    const clubId = req.user!.managedClubId
    if (!clubId) return sendError(res, 'You have not been assigned a club or society yet', 404)

    const club = await prisma.club.findUnique({ where: { id: clubId } })
    if (!club) return sendError(res, 'Club not found', 404)

    const upcomingEvents = await prisma.event.count({
      where: { clubId, status: 'APPROVED', startsAt: { gte: new Date() } }
    })

    return sendSuccess(res, { ...club, upcomingEvents })
  } catch (error) {
    return sendError(res, 'Failed to fetch your club', 500, error)
  }
}