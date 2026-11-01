import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

// GET /api/sports
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
        fixtures: {
          where: { status: 'UPCOMING' },
          orderBy: { scheduledAt: 'asc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // W/L/D record from each team's completed fixtures
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

// GET /api/sports/:id
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const team = await prisma.sportsTeam.findUnique({
      where: { id: req.params.id },
      include: {
        squadMembers: {
          include: { user: { select: { name: true, studentId: true } } }
        },
        fixtures: { orderBy: { scheduledAt: 'asc' } },
        _count: { select: { squadMembers: true } }
      }
    })

    if (!team) return sendError(res, 'Team not found', 404)
    return sendSuccess(res, team)
  } catch (error) {
    return sendError(res, 'Failed to fetch team', 500, error)
  }
}

// POST /api/sports/:id/fixtures
export const createFixture = async (req: AuthRequest, res: Response) => {
  try {
    const { opposition, venue, isHome, scheduledAt, notes } = req.body

    const fixture = await prisma.fixture.create({
      data: {
        teamId: req.params.id,
        opposition,
        venue,
        isHome: isHome ?? true,
        scheduledAt: new Date(scheduledAt),
        notes,
        status: 'UPCOMING'
      }
    })

    return sendSuccess(res, fixture, 'Fixture created successfully', 201)
  } catch (error) {
    return sendError(res, 'Failed to create fixture', 500, error)
  }
}

// PUT /api/sports/:id/fixtures/:fixtureId
export const updateFixture = async (req: AuthRequest, res: Response) => {
  try {
    const { homeScore, awayScore, status, notes } = req.body

    const existing = await prisma.fixture.findFirst({
      where: { id: req.params.fixtureId, teamId: req.params.id }
    })
    if (!existing) return sendError(res, 'Fixture not found for this team', 404)

    const fixture = await prisma.fixture.update({
      where: { id: existing.id },
      data: { homeScore, awayScore, status, notes }
    })

    return sendSuccess(res, fixture, 'Fixture updated successfully')
  } catch (error) {
    return sendError(res, 'Failed to update fixture', 500, error)
  }
}