import { Response, NextFunction, RequestHandler } from 'express'
import { prisma } from '../config/prisma'
import { authenticate, AuthRequest } from './auth'

// Students must confirm their university email first. Leaders and admins were vetted by an admin.
const checkVerified = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const u = req.user!
    if (u.role !== 'STUDENT') return next()
    const row = await prisma.user.findUnique({ where: { id: u.id }, select: { emailVerified: true } })
    if (!row?.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please confirm your university email first. Check your inbox for the link, or use the button at the top of the page.'
      })
    }
    next()
  } catch {
    return res.status(500).json({ success: false, message: 'Could not check your account' })
  }
}

export const verifiedOnly: RequestHandler[] = [authenticate as RequestHandler, checkVerified as RequestHandler]