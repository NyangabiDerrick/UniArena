import { Response } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma'
import { sendSuccess, sendError } from '../../utils/response'
import { AuthRequest } from '../../middleware/auth'

const leaderSelect = { id: true, name: true, studentId: true } as const

const failure = (res: Response, error: unknown, fallback: string) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return sendError(res, 'A group with that name already exists', 409)
    if (error.code === 'P2025') return sendError(res, 'Group not found', 404)
  }
  return sendError(res, fallback, 500, error)
}

const text = (v: unknown) => (v === undefined ? undefined : String(v).trim())
const orNull = (v: unknown) => (v === undefined ? undefined : String(v).trim() || null)

// GET /api/admin/groups: every club, society and team, whatever its status
export const listGroups = async (_req: AuthRequest, res: Response) => {
  try {
    const [clubs, teams] = await Promise.all([
      prisma.club.findMany({
        orderBy: { name: 'asc' },
        include: {
          leaders: { select: leaderSelect },
          _count: { select: { memberships: { where: { status: 'ACTIVE' } } } }
        }
      }),
      prisma.sportsTeam.findMany({
        orderBy: { name: 'asc' },
        include: {
          leaders: { select: leaderSelect },
          _count: { select: { squadMembers: true } }
        }
      })
    ])

    return sendSuccess(res, {
      clubs: clubs.map(({ _count, ...c }) => ({ ...c, members: _count.memberships })),
      teams: teams.map(({ _count, ...t }) => ({ ...t, members: _count.squadMembers }))
    })
  } catch (error) {
    return sendError(res, 'Failed to fetch groups', 500, error)
  }
}

// POST /api/admin/groups
// body: { kind: 'CLUB'|'SOCIETY'|'TEAM', name, description?, category?, sport?, season?, leaderId? }
export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const kind = req.body.kind as 'CLUB' | 'SOCIETY' | 'TEAM'
    const name = String(req.body.name).trim()
    const description = orNull(req.body.description) ?? null
    const category = text(req.body.category)
    const sport = text(req.body.sport)
    const season = orNull(req.body.season) ?? null

    if (kind === 'TEAM' && !sport) return sendError(res, 'Choose the sport for this team', 400)
    if (kind !== 'TEAM' && !category) return sendError(res, 'Choose a category', 400)

    const leader = req.body.leaderId
      ? await prisma.user.findUnique({ where: { id: String(req.body.leaderId) } })
      : null
    if (req.body.leaderId) {
      if (!leader) return sendError(res, 'The chosen leader was not found', 404)
      if (leader.role === 'ADMIN') return sendError(res, 'Administrators cannot be made leaders', 400)
      if (!leader.isActive) return sendError(res, 'That account is suspended', 400)
    }

    const groupId = await prisma.$transaction(async tx => {
      let id: string
      if (kind === 'TEAM') {
        id = (await tx.sportsTeam.create({
          data: { name, description, sport: sport as string, season, status: 'ACTIVE' }
        })).id
      } else {
        id = (await tx.club.create({
          data: {
            name, description, category: category as string,
            type: kind === 'SOCIETY' ? 'SOCIETY' : 'CLUB',
            status: 'ACTIVE'
          }
        })).id
      }

      if (leader) {
        await tx.user.update({
          where: { id: leader.id },
          data: {
            role: 'CLUB_LEADER',
            managedClubId: kind === 'TEAM' ? null : id,
            managedTeamId: kind === 'TEAM' ? id : null
          }
        })
        await tx.notification.create({
          data: {
            userId: leader.id,
            title: 'You are now a leader',
            message: `You were made leader of ${name}. Sign out and in again to see your leader tools.`,
            type: 'club',
            link: kind === 'TEAM' ? null : '/clubs/manage'
          }
        })
      }

      await tx.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: kind === 'TEAM' ? 'Sports team created' : kind === 'SOCIETY' ? 'Society created' : 'Club created',
          targetType: kind === 'TEAM' ? 'SportsTeam' : 'Club',
          targetId: id,
          details: leader ? `${name}. Leader: ${leader.name}` : name
        }
      })

      return id
    })

    return sendSuccess(res, { id: groupId }, `${name} was created`, 201)
  } catch (error) {
    return failure(res, error, 'Failed to create the group')
  }
}

// PUT /api/admin/groups/:kind/:id  (kind is 'club' or 'team')
export const updateGroup = async (req: AuthRequest, res: Response) => {
  try {
    const isTeam = req.params.kind === 'team'
    const b = req.body
    const name = text(b.name)

    const updated = isTeam
      ? await prisma.sportsTeam.update({
          where: { id: req.params.id },
          data: { name, description: orNull(b.description), sport: text(b.sport), season: orNull(b.season) }
        })
      : await prisma.club.update({
          where: { id: req.params.id },
          data: {
            name,
            description: orNull(b.description),
            category: text(b.category),
            type: b.type === 'SOCIETY' || b.type === 'CLUB' ? b.type : undefined
          }
        })

    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: 'Group details updated',
        targetType: isTeam ? 'SportsTeam' : 'Club',
        targetId: updated.id,
        details: updated.name
      }
    })

    return sendSuccess(res, null, `${updated.name} was updated`)
  } catch (error) {
    return failure(res, error, 'Failed to update the group')
  }
}

// PUT /api/admin/groups/:kind/:id/status  body: { status: 'ACTIVE' | 'INACTIVE' }
export const setGroupStatus = async (req: AuthRequest, res: Response) => {
  try {
    const isTeam = req.params.kind === 'team'
    const status = req.body.status as 'ACTIVE' | 'INACTIVE'

    const updated = isTeam
      ? await prisma.sportsTeam.update({ where: { id: req.params.id }, data: { status } })
      : await prisma.club.update({ where: { id: req.params.id }, data: { status } })

    const label = status === 'ACTIVE' ? 'Group activated' : 'Group archived'
    await prisma.auditLog.create({
      data: {
        adminId: req.user!.id,
        action: label,
        targetType: isTeam ? 'SportsTeam' : 'Club',
        targetId: updated.id,
        details: updated.name
      }
    })

    return sendSuccess(res, null, status === 'ACTIVE' ? `${updated.name} is now visible` : `${updated.name} was archived`)
  } catch (error) {
    return failure(res, error, 'Failed to change the status')
  }
}