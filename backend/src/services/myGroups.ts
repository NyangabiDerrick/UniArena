import { Prisma } from '@prisma/client'
import { prisma } from '../config/prisma'

interface GroupUser {
  id: string
  managedClubId: string | null
  managedTeamId: string | null
}

// The clubs, societies and teams a person belongs to: active memberships, squads they
// play in, and the group they lead. This is the one definition of "my groups".
export async function myGroupIds(user: GroupUser) {
  const [memberships, squads] = await Promise.all([
    prisma.clubMembership.findMany({ where: { userId: user.id, status: 'ACTIVE' }, select: { clubId: true } }),
    prisma.squadMember.findMany({ where: { userId: user.id }, select: { teamId: true } })
  ])

  const clubIds = new Set(memberships.map(m => m.clubId))
  if (user.managedClubId) clubIds.add(user.managedClubId)
  const teamIds = new Set(squads.map(s => s.teamId))
  if (user.managedTeamId) teamIds.add(user.managedTeamId)

  return { clubIds: [...clubIds], teamIds: [...teamIds] }
}

// Events a person should see: those of their groups, plus university-wide events
// (no club and no team) that are for everyone.
export const eventsForGroups = (clubIds: string[], teamIds: string[]): Prisma.EventWhereInput => ({
  OR: [
    { clubId: { in: clubIds } },
    { teamId: { in: teamIds } },
    { clubId: null, teamId: null }
  ]
})

// Approved events that have not finished yet
export const upcomingApproved = (now: Date): Prisma.EventWhereInput => ({
  status: 'APPROVED',
  endsAt: { gte: now }
})
