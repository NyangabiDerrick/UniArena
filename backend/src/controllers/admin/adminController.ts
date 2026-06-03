import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

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
      orderBy: { createdAt: 'desc' }
    })

    return sendSuccess(res, users)
  } catch (error) {
    return sendError(res, 'Failed to fetch users', 500, error)
  }
}

// PUT /api/admin/users/:id
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { role, isActive } = req.body

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(role ? { role } : {}),
        ...(isActive !== undefined ? { isActive } : {})
      }
    })

    await prisma.auditLog.create({
      data: {
        adminId: (await prisma.user.findUnique({ where: { email: req.user?.email } }))!.id,
        action: `Updated user — role: ${role}, active: ${isActive}`,
        targetType: 'User',
        targetId: req.params.id
      }
    })

    return sendSuccess(res, user, 'User updated successfully')
  } catch (error) {
    return sendError(res, 'Failed to update user', 500, error)
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