import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

const person = {
  id: true,
  name: true,
  role: true,
  managedClub: { select: { name: true } },
  managedTeam: { select: { name: true } }
} as const

interface PersonRow {
  id: string
  name: string
  role: string
  managedClub: { name: string } | null
  managedTeam: { name: string } | null
}

// Short description shown under a person's name. No emails are ever exposed.
const toPartner = (u: PersonRow) => {
  const group = u.managedClub?.name || u.managedTeam?.name
  const subtitle =
    u.role === 'ADMIN' ? 'Administrator'
    : u.role === 'CLUB_LEADER' ? (group ? `Leader · ${group}` : 'Leader')
    : 'Student'
  return { id: u.id, name: u.name, subtitle }
}

// GET /api/messages/conversations: one entry per person you have talked to
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!.id
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: me }, { receiverId: me }] },
      orderBy: { sentAt: 'desc' },
      take: 500,
      include: { sender: { select: person }, receiver: { select: person } }
    })

    const byPerson = new Map<string, {
      partner: ReturnType<typeof toPartner>
      lastMessage: string
      lastAt: Date
      unread: number
    }>()

    for (const m of messages) {
      const other = m.senderId === me ? m.receiver : m.sender
      let entry = byPerson.get(other.id)
      if (!entry) {
        entry = { partner: toPartner(other), lastMessage: m.content, lastAt: m.sentAt, unread: 0 }
        byPerson.set(other.id, entry)
      }
      if (m.receiverId === me && !m.isRead) entry.unread++
    }

    return sendSuccess(res, Array.from(byPerson.values()))
  } catch (error) {
    return sendError(res, 'Failed to fetch conversations', 500, error)
  }
}

// GET /api/messages/thread/:userId: your messages with one person (also marks theirs as read)
export const getThread = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!.id
    const otherId = req.params.userId

    const other = await prisma.user.findUnique({ where: { id: otherId }, select: person })
    if (!other) return sendError(res, 'Person not found', 404)

    const latest = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: me, receiverId: otherId },
          { senderId: otherId, receiverId: me }
        ]
      },
      orderBy: { sentAt: 'desc' },
      take: 200
    })

    await prisma.message.updateMany({
      where: { senderId: otherId, receiverId: me, isRead: false },
      data: { isRead: true }
    })

    return sendSuccess(res, { partner: toPartner(other), messages: latest.reverse() })
  } catch (error) {
    return sendError(res, 'Failed to fetch messages', 500, error)
  }
}

// POST /api/messages: send a message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const sender = req.user!
    const { receiverId } = req.body
    const content = String(req.body.content).trim()

    if (!content || content.length > 2000) return sendError(res, 'Message must be 1 to 2000 characters', 400)
    if (receiverId === sender.id) return sendError(res, 'You cannot message yourself', 400)

    const receiver = await prisma.user.findUnique({ where: { id: String(receiverId) } })
    if (!receiver || !receiver.isActive) return sendError(res, 'Person not found', 404)

    if (sender.role === 'STUDENT' && receiver.role !== 'CLUB_LEADER' && receiver.role !== 'ADMIN') {
      return sendError(res, 'Students can only message club leaders and administrators', 403)
    }

    const message = await prisma.message.create({
      data: { senderId: sender.id, receiverId: receiver.id, content }
    })

    return sendSuccess(res, message, 'Message sent', 201)
  } catch (error) {
    return sendError(res, 'Failed to send message', 500, error)
  }
}

// GET /api/messages/contacts?search=: people you are allowed to start a conversation with
export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!
    const search = String(req.query.search || '').trim()

    const people = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: me.id },
        ...(me.role === 'STUDENT' ? { role: { in: ['CLUB_LEADER', 'ADMIN'] } } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
      },
      select: person,
      orderBy: { name: 'asc' },
      take: 20
    })

    return sendSuccess(res, people.map(toPartner))
  } catch (error) {
    return sendError(res, 'Failed to fetch contacts', 500, error)
  }
}

// GET /api/messages/unread-count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.message.count({
      where: { receiverId: req.user!.id, isRead: false }
    })
    return sendSuccess(res, { count })
  } catch (error) {
    return sendError(res, 'Failed to count messages', 500, error)
  }
}