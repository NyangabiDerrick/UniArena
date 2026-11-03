import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

const stamp = (d: Date) =>
  d.toLocaleString('en-GB', { timeZone: 'Africa/Nairobi', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const notifySquad = async (tx: Prisma.TransactionClient, teamId: string, title: string, message: string) => {
  const squad = await tx.squadMember.findMany({ where: { teamId }, select: { userId: true } })
  if (squad.length) {
    await tx.notification.createMany({
      data: squad.map(s => ({ userId: s.userId, title, message, type: 'sports', link: `/sports/${teamId}` }))
    })
  }
}

const present = (v: unknown) => v !== undefined && v !== null && v !== ''

// GET /api/sports (public)
export const getTeams = async (req: Request, res: Response) => {
  try {
    const { sport, search } = req.query

    const teams = await prisma.sportsTeam.findMany({
      where: {
        status: 'ACTIVE',
        ...(sport && sport !== 'All' ? { sport: String(sport) } : {}),
        ...(search ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { sport: { contains: String(search), mode: 'insensitive' } }
          ]
        } : {})
      },
      include: {
        _count: { select: { squadMembers: true } },
        fixtures: { where: { status: 'UPCOMING' }, orderBy: { scheduledAt: 'asc' }, take: 3 }
      },
      orderBy: { createdAt: 'desc' }
    })

    const completed = await prisma.fixture.findMany({
      where: { teamId: { in: teams.map(t => t.id) }, status: 'COMPLETED' },
      select: { teamId: true, isHome: true, homeScore: true, awayScore: true }
    })
    const records = new Map<string, { wins: number; losses: number; draws: number }>()
    for (const f of completed) {
      const r = records.get(f.teamId) ?? { wins: 0, losses: 0, draws: 0 }
      const scored = (f.isHome ? f.homeScore : f.awayScore) ?? 0
      const conceded = (f.isHome ? f.awayScore : f.homeScore) ?? 0
      if (scored > conceded) r.wins++
      else if (scored < conceded) r.losses++
      else r.draws++
      records.set(f.teamId, r)
    }

    return sendSuccess(res, teams.map(t => ({
      ...t,
      memberCount: t._count.squadMembers,
      ...(records.get(t.id) ?? { wins: 0, losses: 0, draws: 0 })
    })))
  } catch (error) {
    return sendError(res, 'Failed to fetch teams', 500, error)
  }
}

// GET /api/sports/:id (public: no registration numbers)
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const team = await prisma.sportsTeam.findUnique({
      where: { id: req.params.id },
      include: {
        squadMembers: { include: { user: { select: { name: true } } }, orderBy: { jerseyNumber: 'asc' } },
        fixtures: { orderBy: { scheduledAt: 'asc' } },
        trainingSessions: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
        _count: { select: { squadMembers: true } }
      }
    })
    if (!team || team.status !== 'ACTIVE') return sendError(res, 'Team not found', 404)
    return sendSuccess(res, team)
  } catch (error) {
    return sendError(res, 'Failed to fetch team', 500, error)
  }
}

// POST /api/sports/:id/fixtures (team leader or admin)
// A future date makes an upcoming fixture. A past date needs the final score and is saved as a result.
export const createFixture = async (req: AuthRequest, res: Response) => {
  try {
    const teamId = req.params.id
    const team = await prisma.sportsTeam.findUnique({ where: { id: teamId }, select: { name: true } })
    if (!team) return sendError(res, 'Team not found', 404)

    const when = new Date(req.body.scheduledAt)
    if (Number.isNaN(when.getTime())) return sendError(res, 'Enter a valid date and time', 400)

    const hasOurs = present(req.body.ourScore)
    const hasTheirs = present(req.body.theirScore)
    if (hasOurs !== hasTheirs) return sendError(res, 'Enter both scores', 400)

    const isPast = when < new Date()
    if (isPast && !hasOurs) {
      return sendError(res, 'That date has already passed. Enter the final score to record it as a result.', 400)
    }
    if (!isPast && hasOurs) {
      return sendError(res, "A match that hasn't been played yet can't have a score.", 400)
    }

    const opposition = String(req.body.opposition).trim()
    const isHome: boolean = req.body.isHome ?? true
    const ours = hasOurs ? Number(req.body.ourScore) : null
    const theirs = hasTheirs ? Number(req.body.theirScore) : null

    const fixture = await prisma.$transaction(async tx => {
      const created = await tx.fixture.create({
        data: {
          teamId, opposition, isHome, scheduledAt: when,
          venue: String(req.body.venue).trim(),
          notes: req.body.notes ? String(req.body.notes).trim() || null : null,
          status: ours !== null ? 'COMPLETED' : 'UPCOMING',
          homeScore: ours !== null ? (isHome ? ours : theirs) : null,
          awayScore: ours !== null ? (isHome ? theirs : ours) : null
        }
      })

      if (ours !== null) {
        await notifySquad(tx, teamId, 'Result recorded', `${team.name} ${ours} - ${theirs} ${opposition}`)
      } else {
        await notifySquad(tx, teamId, 'New fixture', `${team.name} vs ${opposition}, ${stamp(when)}.`)
      }

      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: ours !== null ? 'Result recorded' : 'Fixture created',
          targetType: 'SportsTeam', targetId: teamId,
          details: ours !== null ? `${team.name} ${ours} - ${theirs} ${opposition}` : `${team.name} vs ${opposition}`
        }
      })
      return created
    })

    return sendSuccess(res, fixture, ours !== null ? 'Result saved' : 'Fixture added', 201)
  } catch (error) {
    return sendError(res, 'Failed to create fixture', 500, error)
  }
}

// PUT /api/sports/:id/fixtures/:fixtureId
// body: { opposition?, venue?, scheduledAt?, isHome?, notes?, status?: 'UPCOMING'|'COMPLETED', ourScore?, theirScore? }
export const updateFixture = async (req: AuthRequest, res: Response) => {
  try {
    const teamId = req.params.id
    const existing = await prisma.fixture.findFirst({
      where: { id: req.params.fixtureId, teamId },
      include: { team: { select: { name: true } } }
    })
    if (!existing) return sendError(res, 'Fixture not found for this team', 404)

    const b = req.body
    const data: Prisma.FixtureUpdateInput = {}
    if (b.opposition !== undefined) data.opposition = String(b.opposition).trim()
    if (b.venue !== undefined) data.venue = String(b.venue).trim()
    if (b.notes !== undefined) data.notes = b.notes === null ? null : String(b.notes).trim() || null
    if (typeof b.isHome === 'boolean' && existing.status !== 'COMPLETED') data.isHome = b.isHome
    if (b.scheduledAt !== undefined) {
      const when = new Date(b.scheduledAt)
      if (Number.isNaN(when.getTime())) return sendError(res, 'Enter a valid date and time', 400)
      data.scheduledAt = when
    }

    const effectiveWhen = (data.scheduledAt as Date | undefined) ?? existing.scheduledAt
    const opposition = (data.opposition as string | undefined) ?? existing.opposition

    let resultText = ''
    if (b.status === 'COMPLETED') {
      const ours = Number(b.ourScore)
      const theirs = Number(b.theirScore)
      if (!Number.isInteger(ours) || !Number.isInteger(theirs) || ours < 0 || theirs < 0) {
        return sendError(res, 'Enter both scores as whole numbers', 400)
      }
      if (effectiveWhen > new Date()) {
        return sendError(res, "A match that hasn't been played yet can't have a result.", 400)
      }
      data.status = 'COMPLETED'
      data.homeScore = existing.isHome ? ours : theirs
      data.awayScore = existing.isHome ? theirs : ours
      resultText = `${existing.team.name} ${ours} - ${theirs} ${opposition}`
    } else if (b.status === 'UPCOMING') {
      data.status = 'UPCOMING'
      data.homeScore = null
      data.awayScore = null
    }

    const wasCompleted = existing.status === 'COMPLETED'
    const rescheduled = data.scheduledAt !== undefined || data.venue !== undefined

    await prisma.$transaction(async tx => {
      await tx.fixture.update({ where: { id: existing.id }, data })
      if (resultText) {
        await notifySquad(tx, teamId, wasCompleted ? 'Result corrected' : 'Result recorded', resultText)
      } else if (rescheduled && !wasCompleted) {
        await notifySquad(tx, teamId, 'Fixture updated',
          `${existing.team.name} vs ${opposition} is now ${stamp(effectiveWhen)} at ${(data.venue as string | undefined) ?? existing.venue}.`)
      }
      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: resultText ? (wasCompleted ? 'Result corrected' : 'Result recorded') : 'Fixture updated',
          targetType: 'SportsTeam', targetId: teamId,
          details: resultText || `${existing.team.name} vs ${opposition}`
        }
      })
    })

    return sendSuccess(res, null, resultText ? 'Result saved' : 'Fixture updated')
  } catch (error) {
    return sendError(res, 'Failed to update fixture', 500, error)
  }
}

// DELETE /api/sports/:id/fixtures/:fixtureId
export const deleteFixture = async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.fixture.findFirst({
      where: { id: req.params.fixtureId, teamId: req.params.id },
      include: { team: { select: { name: true } } }
    })
    if (!existing) return sendError(res, 'Fixture not found for this team', 404)

    await prisma.$transaction([
      prisma.fixture.delete({ where: { id: existing.id } }),
      prisma.auditLog.create({
        data: {
          adminId: req.user!.id, action: 'Fixture deleted', targetType: 'SportsTeam', targetId: existing.teamId,
          details: `${existing.team.name} vs ${existing.opposition}`
        }
      })
    ])
    return sendSuccess(res, null, 'Fixture deleted')
  } catch (error) {
    return sendError(res, 'Failed to delete fixture', 500, error)
  }
}