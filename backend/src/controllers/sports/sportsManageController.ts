import { Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const jerseyOf = (v: unknown): number | null | undefined => {
  if (v === undefined) return undefined
  if (v === null || v === '') return null
  return Number(v)
}

// GET /api/sports/mine: the team the signed-in leader manages
export const getMyTeam = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user!.managedTeamId
    if (!id) return sendError(res, 'You have not been assigned a sports team yet', 404)
    const team = await prisma.sportsTeam.findUnique({ where: { id }, select: { id: true, name: true, sport: true } })
    if (!team) return sendError(res, 'Team not found', 404)
    return sendSuccess(res, team)
  } catch (error) {
    return sendError(res, 'Failed to fetch your team', 500, error)
  }
}

// GET /api/sports/:id/manage: full view including registration numbers
export const getManageView = async (req: AuthRequest, res: Response) => {
  try {
    const team = await prisma.sportsTeam.findUnique({
      where: { id: req.params.id },
      include: {
        squadMembers: { include: { user: { select: { name: true, studentId: true } } }, orderBy: { jerseyNumber: 'asc' } },
        fixtures: { orderBy: { scheduledAt: 'desc' } },
        trainingSessions: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }
      }
    })
    if (!team) return sendError(res, 'Team not found', 404)
    return sendSuccess(res, team)
  } catch (error) {
    return sendError(res, 'Failed to fetch team', 500, error)
  }
}

// POST /api/sports/:id/squad { studentId, position?, jerseyNumber? }
export const addSquadMember = async (req: AuthRequest, res: Response) => {
  try {
    const teamId = req.params.id
    const regNo = String(req.body.studentId).trim().toUpperCase()
    const jersey = jerseyOf(req.body.jerseyNumber) ?? null
    const position = req.body.position ? String(req.body.position).trim() || null : null

    const team = await prisma.sportsTeam.findUnique({ where: { id: teamId }, select: { name: true } })
    if (!team) return sendError(res, 'Team not found', 404)

    const user = await prisma.user.findUnique({ where: { studentId: regNo }, select: { id: true, name: true, isActive: true } })
    if (!user || !user.isActive) {
      return sendError(res, `No active account has the registration number ${regNo}. The student must register first.`, 400)
    }

    if (await prisma.squadMember.findUnique({ where: { userId_teamId: { userId: user.id, teamId } } })) {
      return sendError(res, `${user.name} is already in the squad`, 409)
    }
    if (jersey !== null && (await prisma.squadMember.findFirst({ where: { teamId, jerseyNumber: jersey } }))) {
      return sendError(res, `Jersey number ${jersey} is already taken`, 409)
    }

    await prisma.$transaction([
      prisma.squadMember.create({ data: { userId: user.id, teamId, position, jerseyNumber: jersey } }),
      prisma.notification.create({
        data: {
          userId: user.id, title: 'Added to a squad', type: 'sports', link: `/sports/${teamId}`,
          message: `You were added to the ${team.name} squad${jersey !== null ? ` as number ${jersey}` : ''}.`
        }
      }),
      prisma.auditLog.create({
        data: { adminId: req.user!.id, action: 'Player added to squad', targetType: 'SportsTeam', targetId: teamId, details: `${user.name} joined ${team.name}` }
      })
    ])
    return sendSuccess(res, null, `${user.name} added to the squad`, 201)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return sendError(res, 'That player or jersey number is already in the squad', 409)
    }
    return sendError(res, 'Failed to add the player', 500, error)
  }
}

// PUT /api/sports/:id/squad/:memberId { position?, jerseyNumber?, isInjured?, isAvailable? }
export const updateSquadMember = async (req: AuthRequest, res: Response) => {
  try {
    const teamId = req.params.id
    const member = await prisma.squadMember.findFirst({ where: { id: req.params.memberId, teamId } })
    if (!member) return sendError(res, 'Player not found in this squad', 404)

    const jersey = jerseyOf(req.body.jerseyNumber)
    if (jersey !== undefined && jersey !== null) {
      const clash = await prisma.squadMember.findFirst({ where: { teamId, jerseyNumber: jersey, id: { not: member.id } } })
      if (clash) return sendError(res, `Jersey number ${jersey} is already taken`, 409)
    }

    await prisma.squadMember.update({
      where: { id: member.id },
      data: {
        ...(jersey !== undefined ? { jerseyNumber: jersey } : {}),
        ...(req.body.position !== undefined ? { position: String(req.body.position).trim() || null } : {}),
        ...(typeof req.body.isInjured === 'boolean' ? { isInjured: req.body.isInjured } : {}),
        ...(typeof req.body.isAvailable === 'boolean' ? { isAvailable: req.body.isAvailable } : {})
      }
    })
    return sendSuccess(res, null, 'Player updated')
  } catch (error) {
    return sendError(res, 'Failed to update the player', 500, error)
  }
}

// DELETE /api/sports/:id/squad/:memberId
export const removeSquadMember = async (req: AuthRequest, res: Response) => {
  try {
    const teamId = req.params.id
    const member = await prisma.squadMember.findFirst({
      where: { id: req.params.memberId, teamId },
      include: { user: { select: { name: true } }, team: { select: { name: true } } }
    })
    if (!member) return sendError(res, 'Player not found in this squad', 404)

    await prisma.$transaction([
      prisma.squadMember.delete({ where: { id: member.id } }),
      prisma.notification.create({
        data: { userId: member.userId, title: 'Removed from a squad', message: `You are no longer in the ${member.team.name} squad.`, type: 'sports' }
      }),
      prisma.auditLog.create({
        data: { adminId: req.user!.id, action: 'Player removed from squad', targetType: 'SportsTeam', targetId: teamId, details: `${member.user.name} left ${member.team.name}` }
      })
    ])
    return sendSuccess(res, null, `${member.user.name} removed from the squad`)
  } catch (error) {
    return sendError(res, 'Failed to remove the player', 500, error)
  }
}

// POST /api/sports/:id/training { dayOfWeek 1-7, startTime, endTime, venue, notes? }
export const addTraining = async (req: AuthRequest, res: Response) => {
  try {
    const teamId = req.params.id
    const { startTime, endTime } = req.body
    if (endTime <= startTime) return sendError(res, 'The session must end after it starts', 400)

    const team = await prisma.sportsTeam.findUnique({ where: { id: teamId }, select: { name: true } })
    if (!team) return sendError(res, 'Team not found', 404)

    const dayOfWeek = Number(req.body.dayOfWeek)
    await prisma.$transaction([
      prisma.trainingSession.create({
        data: {
          teamId, dayOfWeek, startTime, endTime,
          venue: String(req.body.venue).trim(),
          notes: req.body.notes ? String(req.body.notes).trim() || null : null
        }
      }),
      prisma.auditLog.create({
        data: { adminId: req.user!.id, action: 'Training session added', targetType: 'SportsTeam', targetId: teamId, details: `${team.name}: ${DAYS[dayOfWeek]} ${startTime}` }
      })
    ])
    return sendSuccess(res, null, 'Training session added', 201)
  } catch (error) {
    return sendError(res, 'Failed to add the session', 500, error)
  }
}

// DELETE /api/sports/:id/training/:sessionId
export const deleteTraining = async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.trainingSession.findFirst({ where: { id: req.params.sessionId, teamId: req.params.id } })
    if (!session) return sendError(res, 'Session not found', 404)
    await prisma.$transaction([
      prisma.trainingSession.delete({ where: { id: session.id } }),
      prisma.auditLog.create({
        data: { adminId: req.user!.id, action: 'Training session removed', targetType: 'SportsTeam', targetId: session.teamId, details: `${DAYS[session.dayOfWeek]} ${session.startTime}` }
      })
    ])
    return sendSuccess(res, null, 'Training session removed')
  } catch (error) {
    return sendError(res, 'Failed to remove the session', 500, error)
  }
}