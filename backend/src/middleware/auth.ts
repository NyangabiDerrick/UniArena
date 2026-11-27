import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/prisma'
import { verifyApiToken, apiSecret, TokenPayload } from '../utils/token'

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

type CachedUser = {
  id: string; email: string; role: string; studentId: string; isActive: boolean
  managedClubId: string | null; managedTeamId: string | null; passwordChangedAt: Date | null
}

// A few seconds of memory, so a busy person's requests do not each hit the database.
// Anything that changes an account (suspension, role, password) calls clearUserCache().
const USER_TTL_MS = 15_000
const userCache = new Map<string, { at: number; user: CachedUser }>()
export const clearUserCache = () => userCache.clear()

const loadUser = async (email: string): Promise<CachedUser | null> => {
  const hit = userCache.get(email)
  if (hit && Date.now() - hit.at < USER_TTL_MS) return hit.user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true, email: true, role: true, studentId: true, isActive: true,
      managedClubId: true, managedTeamId: true, passwordChangedAt: true
    }
  })
  if (user) {
    if (userCache.size > 5000) userCache.clear()
    userCache.set(email, { at: Date.now(), user })
  }
  return user
}

type Resolved = { user: NonNullable<AuthRequest['user']> } | { status: number; message: string }

// Reads the token (once per request), then loads the CURRENT user.
// Role, suspension and assigned group always come from the database (at most a few seconds old).
const resolveUser = async (req: AuthRequest, res: Response): Promise<Resolved> => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return { status: 401, message: 'Unauthorised — no token provided' }
  if (!apiSecret()) return { status: 500, message: 'Server is not configured correctly' }

  const payload: TokenPayload | null = res.locals.tokenPayload ?? verifyApiToken(token)
  if (!payload?.email) return { status: 401, message: 'Unauthorised — invalid or expired token' }

  try {
    const user = await loadUser(String(payload.email).toLowerCase())
    if (!user) return { status: 401, message: 'Unauthorised — account not found' }
    if (!user.isActive) return { status: 403, message: 'This account has been suspended' }
    // A password reset ends every sign-in that began before it
    if (user.passwordChangedAt && (payload.sid ?? payload.iat ?? 0) * 1000 < user.passwordChangedAt.getTime()) {
      return { status: 401, message: 'Your password was changed. Please sign in again.' }
    }
    return {
      user: {
        id: user.id, email: user.email, role: user.role, studentId: user.studentId,
        managedClubId: user.managedClubId, managedTeamId: user.managedTeamId
      }
    }
  } catch {
    return { status: 500, message: 'Failed to verify account' }
  }
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const result = await resolveUser(req, res)
  if ('user' in result) {
    req.user = result.user
    return next()
  }
  return res.status(result.status).json({ success: false, message: result.message })
}

// Same as authenticate, but a visitor with no (or a bad) token carries on as a signed-out visitor.
export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) return next()
  const result = await resolveUser(req, res)
  if ('user' in result) req.user = result.user
  next()
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
