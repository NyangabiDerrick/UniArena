import { Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

const who = { id: true, name: true, studentId: true, role: true, isActive: true } as const

const NOUN: Record<string, string> = { COMMENT: 'comment', EVENT: 'event', ARTICLE: 'article', MESSAGE: 'message' }

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

    const reportedIds = Array.from(new Set(reports.map(r => r.reportedId)))
    const counts = reportedIds.length
      ? await prisma.warning.groupBy({
          by: ['userId'],
          where: { userId: { in: reportedIds } },
          _count: { _all: true }
        })
      : []
    const warningsOf = new Map(counts.map(c => [c.userId, c._count._all]))

    const parsed = reports.map(r => {
      let evidence: unknown[] = []
      try { evidence = r.evidence ? JSON.parse(r.evidence) : [] } catch { evidence = [] }
      return { ...r, evidence, warningCount: warningsOf.get(r.reportedId) ?? 0 }
    })

    return sendSuccess(res, parsed)
  } catch (error) {
    return sendError(res, 'Failed to fetch reports', 500, error)
  }
}

// PUT /api/admin/reports/:id
// body: { action: 'DISMISS' | 'RESOLVE' | 'WARN' | 'SUSPEND', note?, removeContent? }
export const decideReport = async (req: AuthRequest, res: Response) => {
  try {
    const admin = req.user!
    const { action } = req.body
    const note = req.body.note ? String(req.body.note).trim().slice(0, 500) : null
    const removeContent = req.body.removeContent === true

    const report = await prisma.messageReport.findUnique({
      where: { id: req.params.id },
      include: { reported: true }
    })
    if (!report) return sendError(res, 'Report not found', 404)
    if (report.status !== 'OPEN') return sendError(res, 'This report was already reviewed', 409)

    if ((action === 'WARN' || action === 'SUSPEND') && report.reported.role === 'ADMIN') {
      return sendError(res, 'Administrator accounts cannot be warned or suspended here', 400)
    }
    if (action === 'SUSPEND' && admin.role !== 'ADMIN') {
      return sendError(res, 'Only an administrator can suspend an account', 403)
    }
    if (action === 'WARN' && (!note || note.length < 5)) {
      return sendError(res, 'Write a short note explaining the warning. The person will see it.', 400)
    }

    const kind = report.targetType as string
    const noun = NOUN[kind] ?? 'content'
    const canRemove = ['COMMENT', 'EVENT', 'ARTICLE'].includes(kind) && !!report.targetId
    const removing = removeContent && canRemove && action !== 'DISMISS'
    const takedownReason = note || 'Removed after a report'

    let label =
      action === 'DISMISS' ? 'Report dismissed'
      : action === 'SUSPEND' ? 'Report upheld, account suspended'
      : action === 'WARN' ? 'Report upheld, warning issued'
      : 'Report resolved'
    if (removing) label += ` and ${noun} taken down`

    const ops: Prisma.PrismaPromise<unknown>[] = []

    if (action === 'SUSPEND') {
      ops.push(prisma.user.update({ where: { id: report.reportedId }, data: { isActive: false } }))
    }

    if (action === 'WARN') {
      ops.push(prisma.warning.create({
        data: { userId: report.reportedId, reportId: report.id, message: note!, issuedById: admin.id }
      }))
      ops.push(prisma.notification.create({
        data: {
          userId: report.reportedId,
          title: 'Warning from UniArena administrators',
          message: note!,
          type: 'default'
        }
      }))
    }

    if (removing) {
      if (kind === 'COMMENT') {
        ops.push(prisma.comment.updateMany({ where: { id: report.targetId! }, data: { isApproved: false } }))
      } else if (kind === 'EVENT') {
        ops.push(prisma.event.updateMany({
          where: { id: report.targetId!, status: 'APPROVED' },
          data: { status: 'SUSPENDED', moderationNote: takedownReason, suspendedByAdmin: true }
        }))
      } else if (kind === 'ARTICLE') {
        ops.push(prisma.article.updateMany({
          where: { id: report.targetId!, status: 'PUBLISHED' },
          data: { status: 'HIDDEN', moderationNote: takedownReason, removedByAdmin: true }
        }))
      }

      // A warning already tells the person. Otherwise tell them their content came down.
      if (action !== 'WARN') {
        ops.push(prisma.notification.create({
          data: {
            userId: report.reportedId,
            title: `Your ${noun} was taken down`,
            message: `An administrator took down your ${noun} after a report. Reason: ${takedownReason}`,
            type: 'default'
          }
        }))
      }
    }

    ops.push(prisma.messageReport.update({
      where: { id: report.id },
      data: {
        status: action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
        resolution: note ? `${label}: ${note}` : label,
        resolvedById: admin.id,
        resolvedAt: new Date()
      }
    }))

    ops.push(prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: label,
        targetType: 'MessageReport',
        targetId: report.id,
        details: `About ${report.reported.name}${note ? `. Note: ${note}` : ''}`
      }
    }))

    ops.push(prisma.notification.create({
      data: {
        userId: report.reporterId,
        title: 'Your report was reviewed',
        message: 'Thank you for reporting. An administrator has reviewed it and taken any action needed.',
        type: 'default'
      }
    }))

    await prisma.$transaction(ops)
    return sendSuccess(res, null, label)
  } catch (error) {
    return sendError(res, 'Failed to update report', 500, error)
  }
}