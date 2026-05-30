import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    studentId: string
  }
}

// Verify JWT token
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorised — no token provided'
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'secret'
    ) as AuthRequest['user']

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorised — invalid or expired token'
    })
  }
}

// Check user role
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorised — not logged in'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden — requires one of: ${roles.join(', ')}`
      })
    }

    next()
  }
}

// Role constants
export const ROLES = {
  STUDENT: 'STUDENT',
  CLUB_LEADER: 'CLUB_LEADER',
  SPORTS_CAPTAIN: 'SPORTS_CAPTAIN',
  LECTURER: 'LECTURER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
} as const