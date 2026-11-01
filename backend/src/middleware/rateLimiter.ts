import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const isProd = () => process.env.NODE_ENV === 'production'

// Backstop per IP. Generous, because many students can share one campus IP.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: () => (isProd() ? 600 : 5000),
  message: { success: false, message: 'Too many requests — please try again later' }
})

// Works out who is asking, for the per-person limit below.
// The token must verify, so a forged token cannot get its own allowance.
export const identifyForLimits = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  const secret = process.env.NEXTAUTH_SECRET
  if (token && secret) {
    try {
      const payload = jwt.verify(token, secret) as { email?: string }
      if (payload.email) res.locals.limitKey = `user:${payload.email.toLowerCase()}`
    } catch {
      // Not a valid token: treated as anonymous, so only the IP limit applies
    }
  }
  next()
}

// Per signed-in person. Anonymous requests skip this and use the IP limit.
export const userLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: () => (isProd() ? 240 : 3000),
  keyGenerator: (_req, res) => String(res.locals.limitKey),
  skip: (_req, res) => !res.locals.limitKey,
  message: { success: false, message: 'You are making requests too quickly. Please slow down for a moment.' }
})

// Per IP: used for register, forgot-password and reset-password
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts — please try again later' }
})

// Per email address: used for login, because NextAuth makes every
// login request from the same server IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => String(req.body?.email || 'unknown').toLowerCase(),
  message: { success: false, message: 'Too many login attempts for this account — please try again later' }
})