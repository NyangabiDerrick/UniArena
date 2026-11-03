import { Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

type Action = 'cancel' | 'suspend' | 'restore'
type Actor = NonNullable<AuthRequest['user']>

const manages = (u: Actor, e: { clubId: string | null; teamId: string | null }) =>
  u.role === 'ADMIN' ||
  (u.role === 'CLUB_LEADER' &&
    ((!!e.clubId && e.clubId === u.managedClubId) || (!!e.teamId && e.teamId === u.managedTeamId)))

// GET /api/events/managed: events you are allowed to manage (all of them for an admin)
export const listManagedEvents = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const where: Prisma.EventWhereInput =
      u.role === 'ADMIN'
        ? {}
        : {
            OR: [
              ...(u.managedClubId ? [{ clubId: u.managedClubId }] : []),
              ...(u.managedTeamId ? [{ teamId: u.managedTeamId }] : [])
            ]
          }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startsAt: 'desc' },
      take: 100,
      include: {
        club: { select: { name: true } },
        team: { select: { name: true } },
        _count: { select: { tickets: true } }
      }
    })
    return sendSuccess(res, events)
  } catch (error) {
    return sendError(res, 'Failed to fetch events', 500, error)
  }
}

const change = (action: Action) => async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const isAdmin = u.role === 'ADMIN'
    const reason = req.body.reason ? String(req.body.reason).trim().slice(0, 500) : ''

    const event = await prisma.event.findUnique({ where: { id: req.params.id } })
    if (!event) return sendError(res, 'Event not found', 404)
    if (!manages(u, event)) return sendError(res, 'You can only manage events of your own group', 403)
    if (!isAdmin && event.suspendedByAdmin) {
      return sendError(res, 'An administrator suspended this event. Only an administrator can change it.', 403)
    }

    if (action === 'cancel') {
      if (event.status === 'CANCELLED') return sendError(res, 'This event is already cancelled', 409)
      if (event.endsAt < new Date()) return sendError(res, 'This event has already ended', 400)
      if (reason.length < 5) return sendError(res, 'Give a short reason. Ticket holders will see it.', 400)
    }
    if (action === 'suspend') {
      if (event.status !== 'APPROVED') return sendError(res, 'Only a published event can be suspended', 409)
      if (reason.length < 5) return sendError(res, 'Give a short reason.', 400)
    }
    if (action === 'restore') {
      if (event.status !== 'SUSPENDED' && event.status !== 'CANCELLED') {
        return sendError(res, 'This event is already published', 409)
      }
      if (event.status === 'CANCELLED' && !isAdmin) {
        return sendError(res, 'Only an administrator can reinstate a cancelled event', 403)
      }
    }

    const wasCancelled = event.status === 'CANCELLED'
    const label = action === 'cancel' ? 'Event cancelled' : action === 'suspend' ? 'Event suspended' : 'Event restored'

    const ops: Prisma.PrismaPromise<unknown>[] = []

    ops.push(prisma.event.update({
      where: { id: event.id },
      data:
        action === 'restore'
          ? { status: 'APPROVED', moderationNote: null, suspendedByAdmin: false }
          : { status: action === 'cancel' ? 'CANCELLED' : 'SUSPENDED', moderationNote: reason, suspendedByAdmin: isAdmin }
    }))

    ops.push(prisma.auditLog.create({
      data: {
        adminId: u.id,
        action: `${label} by ${isAdmin ? 'administrator' : 'leader'}`,
        targetType: 'Event',
        targetId: event.id,
        details: `${event.title}${reason ? `. Reason: ${reason}` : ''}`
      }
    }))

    // Tell ticket holders when an event is cancelled, or brought back after a cancellation
    if (action === 'cancel' || (action === 'restore' && wasCancelled)) {
      const holders = await prisma.ticket.findMany({
        where: { eventId: event.id, userId: { not: u.id } },
        select: { userId: true }
      })
      if (holders.length) {
        ops.push(prisma.notification.createMany({
          data: holders.map(h => ({
            userId: h.userId,
            title: action === 'cancel' ? 'Event cancelled' : 'Event is back on',
            message: action === 'cancel'
              ? `${event.title} was cancelled. Reason: ${reason}`
              : `${event.title} has been reinstated. Your ticket is still valid.`,
            type: 'event',
            link: '/tickets'
          }))
        }))
      }
    }

    // When an admin acts, tell the creator and the group's leaders
    if (isAdmin) {
      const leaders = await prisma.user.findMany({
        where: {
          OR: [
            ...(event.clubId ? [{ managedClubId: event.clubId }] : []),
            ...(event.teamId ? [{ managedTeamId: event.teamId }] : [])
          ]
        },
        select: { id: true }
      })
      const ids = new Set([event.createdBy, ...leaders.map(l => l.id)])
      ids.delete(u.id)
      if (ids.size) {
        ops.push(prisma.notification.createMany({
          data: Array.from(ids).map(userId => ({
            userId,
            title: label,
            message: action === 'restore'
              ? `An administrator restored "${event.title}".`
              : `An administrator ${action === 'cancel' ? 'cancelled' : 'suspended'} "${event.title}". Reason: ${reason}`,
            type: 'event',
            link: '/clubs/manage/events'
          }))
        }))
      }
    }

    await prisma.$transaction(ops)
    return sendSuccess(res, null, label)
  } catch (error) {
    return sendError(res, 'Failed to update the event', 500, error)
  }
}

export const cancelEvent = change('cancel')
export const suspendEvent = change('suspend')
export const restoreEvent = change('restore')