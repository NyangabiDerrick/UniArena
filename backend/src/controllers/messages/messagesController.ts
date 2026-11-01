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

const blockedByMe = async (me: string) =>
  (await prisma.userBlock.findMany({ where: { blockerId: me }, select: { blockedId: true } }))
    .map(b => b.blockedId)

// GET /api/messages/conversations: one entry per person (people you blocked are hidden)
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!.id
    const hidden = new Set(await blockedByMe(me))

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
      if (hidden.has(other.id)) continue
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

// GET /api/messages/thread/:userId
export const getThread = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!.id
    const otherId = req.params.userId

    const other = await prisma.user.findUnique({ where: { id: otherId }, select: person })
    if (!other) return sendError(res, 'Person not found', 404)

    const iBlocked = await prisma.userBlock.findFirst({ where: { blockerId: me, blockedId: otherId } })

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

    if (!iBlocked) {
      await prisma.message.updateMany({
        where: { senderId: otherId, receiverId: me, isRead: false },
        data: { isRead: true }
      })
    }

    return sendSuccess(res, {
      partner: toPartner(other),
      messages: latest.reverse(),
      blockedByMe: !!iBlocked
    })
  } catch (error) {
    return sendError(res, 'Failed to fetch messages', 500, error)
  }
}

// POST /api/messages
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

    const block = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: sender.id, blockedId: receiver.id },
          { blockerId: receiver.id, blockedId: sender.id }
        ]
      }
    })
    if (block) {
      // Never reveal that the other person blocked you
      return sendError(
        res,
        block.blockerId === sender.id
          ? 'You blocked this person. Unblock them to send a message.'
          : "You can't send messages to this person.",
        403
      )
    }

    const message = await prisma.message.create({
      data: { senderId: sender.id, receiverId: receiver.id, content }
    })

    return sendSuccess(res, message, 'Message sent', 201)
  } catch (error) {
    return sendError(res, 'Failed to send message', 500, error)
  }
}

// GET /api/messages/contacts?search=
export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!
    const search = String(req.query.search || '').trim()

    const people = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: me.id },
        ...(me.role === 'STUDENT' ? { role: { in: ['CLUB_LEADER', 'ADMIN'] } } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        // Hide anyone you blocked, and anyone who blocked you
        blocksReceived: { none: { blockerId: me.id } },
        blocksMade: { none: { blockedId: me.id } }
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

// GET /api/messages/unread-count (ignores people you blocked)
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!.id
    const blocked = await blockedByMe(me)
    const count = await prisma.message.count({
      where: { receiverId: me, isRead: false, senderId: { notIn: blocked } }
    })
    return sendSuccess(res, { count })
  } catch (error) {
    return sendError(res, 'Failed to count messages', 500, error)
  }
}

// GET /api/messages/blocks: people you blocked
export const getBlocks = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.userBlock.findMany({
      where: { blockerId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { blocked: { select: person } }
    })
    return sendSuccess(res, rows.map(r => toPartner(r.blocked)))
  } catch (error) {
    return sendError(res, 'Failed to fetch blocked people', 500, error)
  }
}

// POST /api/messages/blocks { userId }
export const blockUser = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!.id
    const target = await prisma.user.findUnique({ where: { id: String(req.body.userId) } })
    if (!target) return sendError(res, 'Person not found', 404)
    if (target.id === me) return sendError(res, 'You cannot block yourself', 400)
    if (target.role === 'ADMIN') return sendError(res, 'Administrators cannot be blocked. You can report them instead.', 400)

    await prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId: me, blockedId: target.id } },
      update: {},
      create: { blockerId: me, blockedId: target.id }
    })
    return sendSuccess(res, null, `${target.name} is blocked`, 201)
  } catch (error) {
    return sendError(res, 'Failed to block', 500, error)
  }
}

// DELETE /api/messages/blocks/:userId
export const unblockUser = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.userBlock.deleteMany({
      where: { blockerId: req.user!.id, blockedId: req.params.userId }
    })
    return sendSuccess(res, null, 'Unblocked')
  } catch (error) {
    return sendError(res, 'Failed to unblock', 500, error)
  }
}

// POST /api/messages/reports { userId, reason, details? }
export const reportUser = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!
    const reportedId = String(req.body.userId)
    if (reportedId === me.id) return sendError(res, 'You cannot report yourself', 400)

    const reported = await prisma.user.findUnique({ where: { id: reportedId } })
    if (!reported) return sendError(res, 'Person not found', 404)

    const recent = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: me.id, receiverId: reportedId },
          { senderId: reportedId, receiverId: me.id }
        ]
      },
      orderBy: { sentAt: 'desc' },
      take: 10
    })

    // You can only report someone who actually messaged you
    if (!recent.some(m => m.senderId === reportedId)) {
      return sendError(res, 'You can only report someone who has sent you a message.', 400)
    }

    const open = await prisma.messageReport.findFirst({
      where: { reporterId: me.id, reportedId, status: 'OPEN' }
    })
    if (open) return sendError(res, 'You already reported this person. An administrator will review it.', 409)

    const evidence = JSON.stringify(
      recent.reverse().map(m => ({
        from: m.senderId === me.id ? 'reporter' : 'reported',
        content: m.content,
        sentAt: m.sentAt
      }))
    )

    await prisma.messageReport.create({
      data: {
        reporterId: me.id,
        reportedId,
        reason: String(req.body.reason),
        details: req.body.details ? String(req.body.details).slice(0, 1000) : null,
        evidence
      }
    })

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { id: true } })
    if (admins.length) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          userId: a.id,
          title: 'New message report',
          message: `${reported.name} was reported for a message. Please review it.`,
          type: 'default',
          link: '/admin/reports'
        }))
      })
    }

    return sendSuccess(res, null, 'Report sent. An administrator will review it.', 201)
  } catch (error) {
    return sendError(res, 'Failed to send report', 500, error)
  }
}