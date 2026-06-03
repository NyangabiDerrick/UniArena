import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'
import { v4 as uuidv4 } from 'uuid'

// GET /api/events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { category, search, free } = req.query

    const events = await prisma.event.findMany({
      where: {
        status: 'APPROVED',
        ...(category && category !== 'All' ? {} : {}),
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

// GET /api/events/:id
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

// POST /api/events
export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, venue, startsAt, endsAt, capacity, isFree, clubId, teamId } = req.body

    const user = await prisma.user.findUnique({ where: { email: req.user?.email } })
    if (!user) return sendError(res, 'User not found', 404)

    const event = await prisma.event.create({
      data: {
        title, description, venue,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        capacity: parseInt(capacity),
        isFree: isFree ?? false,
        status: 'PENDING',
        createdBy: user.id,
        ...(clubId ? { clubId } : {}),
        ...(teamId ? { teamId } : {})
      }
    })

    return sendSuccess(res, event, 'Event created and pending approval', 201)
  } catch (error) {
    return sendError(res, 'Failed to create event', 500, error)
  }
}

// POST /api/events/:id/tickets — purchase ticket
export const purchaseTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { tickets: true } } }
    })

    if (!event) return sendError(res, 'Event not found', 404)
    if (event._count.tickets >= event.capacity) return sendError(res, 'Event is sold out', 400)

    const user = await prisma.user.findUnique({ where: { email: req.user?.email } })
    if (!user) return sendError(res, 'User not found', 404)

    const existing = await prisma.ticket.findFirst({
      where: { eventId: id, userId: user.id }
    })
    if (existing) return sendError(res, 'You already have a ticket for this event', 409)

    const ticket = await prisma.ticket.create({
      data: {
        eventId: id,
        userId: user.id,
        price: event.isFree ? 0 : 5,
        qrCode: `UA-${uuidv4().substring(0, 8).toUpperCase()}`,
        type: 'standard'
      }
    })

    return sendSuccess(res, ticket, 'Ticket purchased successfully', 201)
  } catch (error) {
    return sendError(res, 'Failed to purchase ticket', 500, error)
  }
}