import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest, clearUserCache } from '../../middleware/auth'

// GET /api/users/me/export: everything UniArena holds about the signed-in person, as one JSON file
export const exportMyData = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user!.id

    const [profile, memberships, committees, squads, tickets, sent, received, notifications, comments, posts, warnings, appeals, exits, blocks] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id },
          select: {
            id: true, name: true, email: true, studentId: true, faculty: true, yearOfStudy: true, bio: true, role: true,
            emailVerified: true, policyVersion: true, policyAcceptedAt: true, createdAt: true
          }
        }),
        prisma.clubMembership.findMany({ where: { userId: id }, select: { status: true, tier: true, joinedAt: true, club: { select: { name: true } } } }),
        prisma.clubCommittee.findMany({ where: { userId: id }, select: { role: true, club: { select: { name: true } } } }),
        prisma.squadMember.findMany({ where: { userId: id }, select: { position: true, jerseyNumber: true, joinedAt: true, team: { select: { name: true } } } }),
        prisma.ticket.findMany({ where: { userId: id }, select: { qrCode: true, type: true, price: true, purchasedAt: true, event: { select: { title: true, startsAt: true } } } }),
        prisma.message.findMany({ where: { senderId: id }, select: { content: true, sentAt: true, receiver: { select: { name: true } } }, orderBy: { sentAt: 'asc' } }),
        prisma.message.findMany({ where: { receiverId: id }, select: { content: true, sentAt: true, sender: { select: { name: true } } }, orderBy: { sentAt: 'asc' } }),
        prisma.notification.findMany({ where: { userId: id }, select: { title: true, message: true, createdAt: true } }),
        prisma.comment.findMany({ where: { userId: id }, select: { content: true, createdAt: true, article: { select: { title: true } } } }),
        prisma.discussionBoard.findMany({ where: { userId: id }, select: { title: true, content: true, createdAt: true, club: { select: { name: true } } } }),
        prisma.warning.findMany({ where: { userId: id }, select: { message: true, createdAt: true } }),
        prisma.appeal.findMany({ where: { userId: id }, select: { message: true, status: true, decision: true, createdAt: true } }),
        prisma.membershipExit.findMany({ where: { userId: id }, select: { reason: true, createdAt: true } }),
        prisma.userBlock.findMany({ where: { blockerId: id }, select: { createdAt: true, blocked: { select: { name: true } } } })
      ])

    res.setHeader('Content-Disposition', 'attachment; filename="uniarena-my-data.json"')
    return sendSuccess(res, {
      exportedAt: new Date().toISOString(),
      profile, memberships, committees, squads, tickets,
      messagesSent: sent, messagesReceived: received,
      notifications, comments, discussionPosts: posts, warnings, appeals, membershipExits: exits, peopleIBlocked: blocks
    })
  } catch (error) {
    return sendError(res, 'Failed to export your data', 500, error)
  }
}

// DELETE /api/users/me { password }: a student removes their own account and the data tied to it.
// Leaders and administrators own records other people depend on, so an administrator removes those accounts.
export const deleteMyAccount = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user!
    if (me.role !== 'STUDENT') {
      return sendError(res, 'Leader and administrator accounts are removed by an administrator. Please contact one.', 403)
    }

    const user = await prisma.user.findUnique({ where: { id: me.id } })
    const matches = user?.passwordHash ? await bcrypt.compare(String(req.body.password ?? ''), user.passwordHash) : false
    if (!user || !matches) return sendError(res, 'That password is not correct', 401)

    const id = user.id
    const [events, articles, audit, issued] = await Promise.all([
      prisma.event.count({ where: { createdBy: id } }),
      prisma.article.count({ where: { authorId: id } }),
      prisma.auditLog.count({ where: { adminId: id } }),
      prisma.warning.count({ where: { issuedById: id } })
    ])
    if (events + articles + audit + issued > 0) {
      return sendError(res, 'Your account is linked to events or news you published. Please ask an administrator to remove it.', 409)
    }

    await prisma.$transaction([
      prisma.appeal.updateMany({ where: { decidedById: id }, data: { decidedById: null } }),
      prisma.messageReport.updateMany({ where: { resolvedById: id }, data: { resolvedById: null } }),
      prisma.club.updateMany({ where: { advisorId: id }, data: { advisorId: null } }),
      prisma.messageReport.deleteMany({ where: { OR: [{ reporterId: id }, { reportedId: id }] } }),
      prisma.warning.deleteMany({ where: { userId: id } }),
      prisma.appeal.deleteMany({ where: { userId: id } }),
      prisma.userBlock.deleteMany({ where: { OR: [{ blockerId: id }, { blockedId: id }] } }),
      prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } }),
      prisma.comment.deleteMany({ where: { userId: id } }),
      prisma.ticket.deleteMany({ where: { userId: id } }),
      prisma.media.deleteMany({ where: { uploadedBy: id } }),
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.discussionBoard.deleteMany({ where: { userId: id } }),
      prisma.clubMembership.deleteMany({ where: { userId: id } }),
      prisma.clubCommittee.deleteMany({ where: { userId: id } }),
      prisma.squadMember.deleteMany({ where: { userId: id } }),
      prisma.membershipExit.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } })
    ])
    clearUserCache()

    return sendSuccess(res, null, 'Your account and its data were deleted.')
  } catch (error) {
    return sendError(res, 'Failed to delete your account', 500, error)
  }
}
