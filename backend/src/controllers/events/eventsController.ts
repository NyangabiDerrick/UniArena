import { Request, Response } from 'express'
import crypto from 'crypto'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// GET /api/events (public): approved events with how many tickets are taken
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { search, free } = req.query

    const events = await prisma.event.findMany({
      where: {
        status: 'APPROVED',
        ...(free === 'true' ? { isFree: true } : {}),
        ...(search ? {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' } },
            { venue: { contains: String(search), mode: 'insensitive' } }
          ]
        } : {})
      },
      include: {
        club: { select: { name: true } },
        team: { select: { name: true } },
        creator: { select: { name: true } },
        _count: { select: { tickets: true } }
      },
      orderBy: { startsAt: 'asc' }
    })

    return sendSuccess(res, events)
  } catch (error) {
    return sendError(res, 'Failed to fetch events', 500, error)
  }
}

// GET /api/events/:id (public)
export const getEventById = async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        club: { select: { name: true } },
        team: { select: { name: true } },
        creator: { select: { name: true } },
        _count: { select: { tickets: true } }
      }
    })

    if (!event) return sendError(res, 'Event not found', 404)
    return sendSuccess(res, event)
  } catch (error) {
    return sendError(res, 'Failed to fetch event', 500, error)
  }
}

// POST /api/events (leader for their own group, or admin)
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const u = req.user!
    const { title, description, venue, startsAt, endsAt, capacity, isFree } = req.body

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

    const event = await prisma.event.create({
      data: {
        title, description, venue,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        capacity: parseInt(capacity),
        isFree: isFree ?? false,
        status: u.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
        createdBy: u.id,
        ...(clubId ? { clubId } : {}),
        ...(teamId ? { teamId } : {})
      }
    })

    return sendSuccess(res, event, u.role === 'ADMIN' ? 'Event created' : 'Event created and pending approval', 201)
  } catch (error) {
    return sendError(res, 'Failed to create event', 500, error)
  }
}

// POST /api/events/:id/tickets: RSVP for a free event
export const purchaseTicket = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const eventId = req.params.id

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event || event.status !== 'APPROVED') return sendError(res, 'Event not found', 404)
    if (event.endsAt < new Date()) return sendError(res, 'This event has already ended', 400)

    // Paid tickets stay off until a payment provider is connected
    if (!event.isFree) {
      return sendError(res, 'Paid tickets are not available yet. Online payments are coming soon.', 400)
    }

    const ticket = await prisma.$transaction(async tx => {
      const existing = await tx.ticket.findFirst({ where: { eventId, userId } })
      if (existing) throw new Error('ALREADY_HAS_TICKET')

      const taken = await tx.ticket.count({ where: { eventId } })
      if (taken >= event.capacity) throw new Error('SOLD_OUT')

      const created = await tx.ticket.create({
        data: {
          eventId, userId,
          price: 0,
          type: 'standard',
          qrCode: `UA-${crypto.randomBytes(5).toString('hex').toUpperCase()}`
        }
      })

      await tx.notification.create({
        data: {
          userId,
          title: 'RSVP confirmed',
          message: `You are going to ${event.title}. Your ticket code is ${created.qrCode}.`,
          type: 'event',
          link: '/tickets'
        }
      })

      return created
    })

    return sendSuccess(res, ticket, 'You are going! Your ticket is confirmed.', 201)
  } catch (error: any) {
    if (error.message === 'ALREADY_HAS_TICKET') return sendError(res, 'You already have a ticket for this event', 409)
    if (error.message === 'SOLD_OUT') return sendError(res, 'This event is sold out', 409)
    return sendError(res, 'Failed to get your ticket', 500, error)
  }
}

// GET /api/events/tickets/mine: the signed-in user's own tickets
export const getMyTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user!.id },
      include: {
        event: { select: { id: true, title: true, venue: true, startsAt: true, endsAt: true } }
      },
      orderBy: { purchasedAt: 'desc' }
    })
    return sendSuccess(res, tickets)
  } catch (error) {
    return sendError(res, 'Failed to fetch your tickets', 500, error)
  }
}