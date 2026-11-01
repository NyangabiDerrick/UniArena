import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

const who = { id: true, name: true, studentId: true, role: true, isActive: true } as const

// GET /api/admin/reports?status=OPEN|RESOLVED|DISMISSED
export const listReports = async (req: AuthRequest, res: Response) => {
  try {
    const status = String(req.query.status || 'OPEN')
    if (!['OPEN', 'RESOLVED', 'DISMISSED'].includes(status)) return sendError(res, 'Invalid status', 400)

    const reports = await prisma.messageReport.findMany({
      where: { status: status as 'OPEN' | 'RESOLVED' | 'DISMISSED' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { reporter: { select: who }, reported: { select: who } }
    })

    const parsed = reports.map(r => {
      let evidence: unknown[] = []
      try { evidence = r.evidence ? JSON.parse(r.evidence) : [] } catch { evidence = [] }
      return { ...r, evidence }
    })

    return sendSuccess(res, parsed)
  } catch (error) {
    return sendError(res, 'Failed to fetch reports', 500, error)
  }
}

// PUT /api/admin/reports/:id { action: 'DISMISS' | 'RESOLVE' | 'SUSPEND', note? }
export const decideReport = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!
    const { action } = req.body
    const note = req.body.note ? String(req.body.note).slice(0, 500) : null

    const report = await prisma.messageReport.findUnique({
      where: { id: req.params.id },
      include: { reported: true }
    })
    if (!report) return sendError(res, 'Report not found', 404)
    if (report.status !== 'OPEN') return sendError(res, 'This report was already reviewed', 409)

    if (action === 'SUSPEND') {
      if (admin.role !== 'ADMIN') return sendError(res, 'Only an administrator can suspend an account', 403)
      if (report.reported.role === 'ADMIN') return sendError(res, 'Administrator accounts cannot be suspended here', 400)
    }

    const label =
      action === 'DISMISS' ? 'Report dismissed'
      : action === 'SUSPEND' ? 'Report upheld, account suspended'
      : 'Report resolved'

    await prisma.$transaction([
      ...(action === 'SUSPEND'
        ? [prisma.user.update({ where: { id: report.reportedId }, data: { isActive: false } })]
        : []),
      prisma.messageReport.update({
        where: { id: report.id },
        data: {
          status: action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
          resolution: note ? `${label}: ${note}` : label,
          resolvedById: admin.id,
          resolvedAt: new Date()
        }
      }),
      prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: label,
          targetType: 'MessageReport',
          targetId: report.id,
          details: `About ${report.reported.name}${note ? `. Note: ${note}` : ''}`
        }
      }),
      prisma.notification.create({
        data: {
          userId: report.reporterId,
          title: 'Your report was reviewed',
          message: 'Thank you for reporting. An administrator has reviewed it and taken any action needed.',
          type: 'default'
        }
      })
    ])

    return sendSuccess(res, null, label)
  } catch (error) {
    return sendError(res, 'Failed to update report', 500, error)
  }
}