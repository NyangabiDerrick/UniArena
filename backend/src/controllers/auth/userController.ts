import { Response } from 'express'
import { prisma } from '../../config/prisma'
import { AuthRequest } from '../../middleware/auth'

const hideSecrets = { passwordHash: true, resetToken: true, resetTokenExpiry: true, verifyToken: true, verifyTokenExpiry: true } as const

const VALID_REASONS = ['SCHEDULE_CLASH', 'NO_LONGER_INTERESTED', 'MOVING_ON', 'COST', 'NOT_WELCOMING', 'OTHER', 'PREFER_NOT_TO_SAY'] as const

// GET /api/users/profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      omit: hideSecrets,
      include: {
        clubMemberships: {
          where: { status: 'ACTIVE' },
          include: {
            club: { select: { id: true, name: true, logoUrl: true, category: true, type: true } }
          }
        },
        managedClub: { select: { id: true, name: true } },
        managedTeam: { select: { id: true, name: true } }
      }
    })

    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    return res.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return res.status(500).json({ success: false, message: 'Error fetching profile' })
  }
}

// PUT /api/users/profile { faculty?, yearOfStudy?, bio? }
// Name and registration number are not editable: they must match the university record.
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { faculty, yearOfStudy, bio } = req.body

    let year: number | null | undefined = undefined
    if (yearOfStudy !== undefined) {
      if (yearOfStudy === null || yearOfStudy === '') {
        year = null
      } else {
        year = parseInt(String(yearOfStudy), 10)
        if (Number.isNaN(year) || year < 1 || year > 8) {
          return res.status(400).json({ success: false, message: 'Year of study must be between 1 and 8' })
        }
      }
    }

    const cleanBio = bio === undefined ? undefined : (String(bio).trim().slice(0, 300) || null)
    const cleanFaculty = faculty === undefined ? undefined : (String(faculty).trim().slice(0, 100) || null)

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { faculty: cleanFaculty, yearOfStudy: year, bio: cleanBio },
      omit: hideSecrets
    })

    return res.json({ success: true, message: 'Profile updated', data: user })
  } catch (error) {
    console.error('Error updating profile:', error)
    return res.status(500).json({ success: false, message: 'Error updating profile' })
  }
}

// GET /api/users/leave-reasons: the dropdown options
export const getLeaveReasons = async (_req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    data: [
      { value: 'SCHEDULE_CLASH', label: 'Clashes with my classes or exams' },
      { value: 'NO_LONGER_INTERESTED', label: 'No longer interested' },
      { value: 'MOVING_ON', label: 'Graduating or moving on' },
      { value: 'COST', label: 'Cost or fees' },
      { value: 'NOT_WELCOMING', label: 'The group is not welcoming' },
      { value: 'OTHER', label: 'Something else' },
      { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
    ]
  })
}

// POST /api/clubs/:id/leave { reason? }
// The reason is optional and stored as a code only. It is never shown with a name.
export const leaveGroup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const clubId = req.params.id
    const reason = req.body.reason as string | undefined

    const membership = await prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId, clubId } }
    })
    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'You are not an active member of this group' })
    }

    const safeReason = (reason && (VALID_REASONS as readonly string[]).includes(reason) ? reason : 'PREFER_NOT_TO_SAY') as typeof VALID_REASONS[number]

    await prisma.$transaction([
      prisma.clubMembership.delete({ where: { userId_clubId: { userId, clubId } } }),
      prisma.membershipExit.create({ data: { userId, clubId, reason: safeReason } })
    ])

    return res.json({ success: true, message: 'You have left the group' })
  } catch (error) {
    console.error('Error leaving group:', error)
    return res.status(500).json({ success: false, message: 'Could not leave the group' })
  }
}

// GET /api/clubs/:id/insights (leader of this club, or admin)
// Totals only: no names, no emails, and no individual reasons.
export const getGroupInsights = async (req: AuthRequest, res: Response) => {
  try {
    const clubId = req.params.id
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

    const [joins, exits, active] = await Promise.all([
      prisma.clubMembership.findMany({
        where: { clubId, status: 'ACTIVE', joinedAt: { gte: since } },
        select: { joinedAt: true }
      }),
      prisma.membershipExit.groupBy({
        by: ['reason'],
        where: { clubId, createdAt: { gte: since } },
        _count: { _all: true }
      }),
      prisma.clubMembership.count({ where: { clubId, status: 'ACTIVE' } })
    ])

    const monthly: Record<string, { joined: number }> = {}
    for (const j of joins) {
      const key = j.joinedAt.toISOString().slice(0, 7)
      monthly[key] = monthly[key] ?? { joined: 0 }
      monthly[key].joined++
    }

    const leftInWindow = exits.reduce((sum, e) => sum + e._count._all, 0)

    return res.json({
      success: true,
      data: {
        windowDays: 90,
        activeMembers: active,
        joinedInWindow: joins.length,
        leftInWindow,
        monthly,
        reasons: exits.map(e => ({ reason: e.reason, count: e._count._all }))
      }
    })
  } catch (error) {
    console.error('Error loading insights:', error)
    return res.status(500).json({ success: false, message: 'Could not load insights' })
  }
}

// GET /api/users/dashboard: everything the dashboard needs, for this user only
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const now = new Date()

    const memberships = await prisma.clubMembership.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { club: { select: { id: true, name: true, type: true, category: true } } }
    })
    const pendingRequests = await prisma.clubMembership.count({ where: { userId, status: 'PENDING' } })
    const squads = await prisma.squadMember.findMany({
      where: { userId },
      include: { team: { select: { id: true, name: true, sport: true } } }
    })

    const clubIds = memberships.map(m => m.clubId)
    const teamIds = squads.map(s => s.teamId)
    const groupFilter: any[] = []
    if (clubIds.length) groupFilter.push({ clubId: { in: clubIds } })
    if (teamIds.length) groupFilter.push({ teamId: { in: teamIds } })

    const events = groupFilter.length
      ? await prisma.event.findMany({
          where: { status: 'APPROVED', startsAt: { gte: now }, OR: groupFilter },
          orderBy: { startsAt: 'asc' },
          take: 5,
          include: { club: { select: { name: true } }, team: { select: { name: true } } }
        })
      : []

    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', OR: [...groupFilter, { isUniversityWide: true }] },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { club: { select: { name: true } }, team: { select: { name: true } } }
    })

    const tickets = await prisma.ticket.count({ where: { userId, event: { startsAt: { gte: now } } } })

    return res.json({
      success: true,
      data: {
        clubs: memberships.map(m => m.club),
        teams: squads.map(s => s.team),
        pendingRequests,
        tickets,
        events,
        articles
      }
    })
  } catch (error) {
    console.error('Error loading dashboard:', error)
    return res.status(500).json({ success: false, message: 'Error loading dashboard' })
  }
}