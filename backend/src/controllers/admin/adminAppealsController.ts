import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// GET /api/admin/appeals?status=OPEN|APPROVED|REJECTED
export const listAppeals = async (req: AuthRequest, res: Response) => {
  try {
    const status = String(req.query.status || 'OPEN')
    if (!['OPEN', 'APPROVED', 'REJECTED'].includes(status)) return sendError(res, 'Invalid status', 400)

    const appeals = await prisma.appeal.findMany({
      where: { status: status as 'OPEN' | 'APPROVED' | 'REJECTED' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: {
            id: true, name: true, studentId: true, email: true, isActive: true,
            warnings: {
              orderBy: { createdAt: 'desc' },
              take: 5,
              select: { message: true, createdAt: true }
            },
            reportsAgainst: {
              where: { status: 'RESOLVED' },
              orderBy: { resolvedAt: 'desc' },
              take: 3,
              select: { reason: true, resolution: true, resolvedAt: true }
            }
          }
        }
      }
    })

    return sendSuccess(res, appeals)
  } catch (error) {
    return sendError(res, 'Failed to fetch appeals', 500, error)
  }
}

// PUT /api/admin/appeals/:id { action: 'APPROVE' | 'REJECT', note? }
export const decideAppeal = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!
    const { action } = req.body
    const note = req.body.note ? String(req.body.note).trim().slice(0, 500) : null

    if (action === 'REJECT' && (!note || note.length < 5)) {
      return sendError(res, 'Write a short reason. The person will see it.', 400)
    }

    const appeal = await prisma.appeal.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    })
    if (!appeal) return sendError(res, 'Appeal not found', 404)
    if (appeal.status !== 'OPEN') return sendError(res, 'This appeal was already decided', 409)

    const approve = action === 'APPROVE'
    const label = approve ? 'Appeal approved, account restored' : 'Appeal declined'

    await prisma.$transaction([
      ...(approve
        ? [prisma.user.update({ where: { id: appeal.userId }, data: { isActive: true } })]
        : []),
      prisma.appeal.update({
        where: { id: appeal.id },
        data: {
          status: approve ? 'APPROVED' : 'REJECTED',
          decision: note,
          decidedById: admin.id,
          decidedAt: new Date()
        }
      }),
      prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: label,
          targetType: 'Appeal',
          targetId: appeal.id,
          details: `${appeal.user.name}${note ? `. Note: ${note}` : ''}`
        }
      }),
      ...(approve
        ? [prisma.notification.create({
            data: {
              userId: appeal.userId,
              title: 'Your account was restored',
              message: note ? `Your appeal was approved. ${note}` : 'Your appeal was approved. Welcome back.',
              type: 'default'
            }
          })]
        : [])
    ])

    return sendSuccess(res, null, label)
  } catch (error) {
    return sendError(res, 'Failed to update appeal', 500, error)
  }
}