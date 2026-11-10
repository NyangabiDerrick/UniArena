import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    studentId: string
    managedClubId: string | null
    managedTeamId: string | null
  }
}

// Verifies the token, then loads the CURRENT user from the database.
// Role, suspension and assigned group always come from the database.
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorised — no token provided' })
  }

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    return res.status(500).json({ success: false, message: 'Server is not configured correctly' })
  }

  let payload: any
  try {
    payload = jwt.verify(token, secret)
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorised — invalid or expired token' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: String(payload.email).toLowerCase() },
      select: {
        id: true, email: true, role: true, studentId: true, isActive: true,
        managedClubId: true, managedTeamId: true
      }
    })

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorised — account not found' })
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been suspended' })
    }

    req.user = {
      id: user.id, email: user.email, role: user.role, studentId: user.studentId,
      managedClubId: user.managedClubId, managedTeamId: user.managedTeamId
    }
    next()
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to verify account' })
  }
}

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorised — not logged in' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden — you do not have permission' })
    }
    next()
  }
}

// Admin: always allowed. Leader: only for the club/team they were assigned to.
export const requireGroupManager = (kind: 'club' | 'team', param = 'id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const u = req.user
    if (!u) {
      return res.status(401).json({ success: false, message: 'Unauthorised — not logged in' })
    }
    if (u.role === 'ADMIN') return next()

    const owned = kind === 'club' ? u.managedClubId : u.managedTeamId
    if (u.role === 'CLUB_LEADER' && owned && owned === req.params[param]) return next()

    return res.status(403).json({ success: false, message: 'You can only manage the group you lead' })
  }
}

export const ROLES = {
  STUDENT: 'STUDENT',
  CLUB_LEADER: 'CLUB_LEADER',
  SPORTS_CAPTAIN: 'SPORTS_CAPTAIN',
  LECTURER: 'LECTURER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
} as const