import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'
const hideSecrets = { passwordHash: true, resetToken: true, resetTokenExpiry: true } as const

// GET /api/admin/users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query

    const users = await prisma.user.findMany({
      where: {
        ...(role && role !== 'ALL' ? { role: String(role) as any } : {}),
        ...(search ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { email: { contains: String(search), mode: 'insensitive' } }
          ]
        } : {})
      },
      omit: hideSecrets,
      include: {
        managedClub: { select: { id: true, name: true } },
        managedTeam: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return sendSuccess(res, users)
  } catch (error) {
    return sendError(res, 'Failed to fetch users', 500, error)
  }
}

// Suspend or reactivate an account. Role changes go through assignLeader.
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body
    if (typeof isActive !== 'boolean') return sendError(res, 'isActive must be true or false', 400)
    if (req.params.id === req.user!.id) return sendError(res, 'You cannot suspend your own account', 400)

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      omit: hideSecrets
    })

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: isActive ? 'Account reactivated' : 'Account suspended',
        targetType: 'User',
        targetId: user.id,
        details: `${user.name} (${user.email})`
      }
    })

    return sendSuccess(res, user, isActive ? 'Account reactivated' : 'Account suspended')
  } catch (error) {
    return sendError(res, 'Failed to update user', 500, error)
  }
}

// body: { groupType: 'CLUB' | 'TEAM' | 'NONE', groupId?: string }
export const assignLeader = async (req: AuthRequest, res: Response) => {
  try {
    const { groupType, groupId } = req.body

    const target = await prisma.user.findUnique({ where: { id: req.params.id } })
    if (!target) return sendError(res, 'User not found', 404)
    if (target.role === 'ADMIN') return sendError(res, 'Admins cannot be made leaders', 400)
    if (!target.isActive) return sendError(res, 'This account is suspended', 400)

    let data: any
    let detail: string

    if (groupType === 'NONE') {
      data = { role: 'STUDENT', managedClubId: null, managedTeamId: null }
      detail = 'Leader role removed'
    } else if (groupType === 'CLUB') {
      const club = await prisma.club.findUnique({ where: { id: String(groupId) } })
      if (!club) return sendError(res, 'Club not found', 404)
      data = { role: 'CLUB_LEADER', managedClubId: club.id, managedTeamId: null }
      detail = `Now leads ${club.name}`
    } else if (groupType === 'TEAM') {
      const team = await prisma.sportsTeam.findUnique({ where: { id: String(groupId) } })
      if (!team) return sendError(res, 'Team not found', 404)
      data = { role: 'CLUB_LEADER', managedTeamId: team.id, managedClubId: null }
      detail = `Now leads ${team.name}`
    } else {
      return sendError(res, 'groupType must be CLUB, TEAM or NONE', 400)
    }

    const user = await prisma.user.update({
      where: { id: target.id },
      data,
      omit: hideSecrets,
      include: {
        managedClub: { select: { id: true, name: true } },
        managedTeam: { select: { id: true, name: true } }
      }
    })

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'Leader assignment changed',
        targetType: 'User',
        targetId: target.id,
        details: `${target.name}: ${detail}`
      }
    })

    return sendSuccess(res, user, detail)
  } catch (error) {
    return sendError(res, 'Failed to assign leader', 500, error)
  }
}

// GET /api/admin/approvals/clubs
export const getPendingClubs = async (req: Request, res: Response) => {
  try {
    const clubs = await prisma.club.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    })
    return sendSuccess(res, clubs)
  } catch (error) {
    return sendError(res, 'Failed to fetch pending clubs', 500, error)
  }
}

// PUT /api/admin/approvals/clubs/:id
export const approveClub = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body

    const club = await prisma.club.update({
      where: { id: req.params.id },
      data: { status }
    })

    const admin = await prisma.user.findUnique({ where: { email: req.user?.email } })

    await prisma.auditLog.create({
      data: {
        adminId: admin!.id,
        action: `Club ${status.toLowerCase()}`,
        targetType: 'Club',
        targetId: req.params.id
      }
    })

    return sendSuccess(res, club, `Club ${status.toLowerCase()} successfully`)
  } catch (error) {
    return sendError(res, 'Failed to update club status', 500, error)
  }
}

// GET /api/admin/approvals/events
export const getPendingEvents = async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PENDING' },
      include: { creator: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return sendSuccess(res, events)
  } catch (error) {
    return sendError(res, 'Failed to fetch pending events', 500, error)
  }
}

// PUT /api/admin/approvals/events/:id
export const approveEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { status }
    })

    return sendSuccess(res, event, `Event ${status.toLowerCase()} successfully`)
  } catch (error) {
    return sendError(res, 'Failed to update event status', 500, error)
  }
}

// GET /api/admin/audit-logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    return sendSuccess(res, logs)
  } catch (error) {
    return sendError(res, 'Failed to fetch audit logs', 500, error)
  }
}

// GET /api/admin/analytics
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalClubs, totalEvents, pendingApprovals] = await Promise.all([
      prisma.user.count(),
      prisma.club.count({ where: { status: 'ACTIVE' } }),
      prisma.event.count({ where: { status: 'APPROVED' } }),
      prisma.club.count({ where: { status: 'PENDING' } })
    ])

    return sendSuccess(res, { totalUsers, totalClubs, totalEvents, pendingApprovals })
  } catch (error) {
    return sendError(res, 'Failed to fetch analytics', 500, error)
  }
}