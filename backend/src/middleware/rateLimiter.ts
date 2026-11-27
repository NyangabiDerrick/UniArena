import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'
import { verifyApiToken, trustedClientIp } from '../utils/token'

const isProd = () => process.env.NODE_ENV === 'production'

const tooMany = (message: string) => ({ success: false, message })

// Backstop per IP. Very generous, because thousands of students can share one campus address.
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: () => (isProd() ? 3000 : 20000),
  message: tooMany('Too many requests — please try again later')
})

// Works out who is asking, for the per-person limit below. The token is checked once here and the
// result is reused by authenticate(), so a forged token cannot get its own allowance.
export const identifyForLimits = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (token) {
    const payload = verifyApiToken(token)
    if (payload) {
      res.locals.tokenPayload = payload
      if (payload.email) res.locals.limitKey = `user:${payload.email.toLowerCase()}`
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
  message: tooMany('You are making requests too quickly. Please slow down for a moment.')
})

// Each sensitive action gets its own counter, so one cannot use up another's allowance.
const perIp = (max: number, windowMs: number, message: string) =>
  rateLimit({ windowMs, max: () => (isProd() ? max : max * 20), message: tooMany(message) })

const emailOf = (req: Request) => String(req.body?.email || 'unknown').trim().toLowerCase()
const visitorOf = (req: Request) => trustedClientIp(req) || req.ip || 'unknown'

export const registerLimiter = perIp(30, 15 * 60 * 1000, 'Too many sign-up attempts from this network — please try again later')
export const verifyEmailLimiter = perIp(60, 15 * 60 * 1000, 'Too many attempts — please try again later')
export const resetPasswordLimiter = perIp(30, 15 * 60 * 1000, 'Too many attempts — please try again later')

// Reset emails: a few per address per hour, plus a looser limit per network
export const forgotPasswordLimiters = [
  rateLimit({ windowMs: 60 * 60 * 1000, max: () => (isProd() ? 5 : 100), keyGenerator: emailOf, message: tooMany('Too many reset requests for this address — please try again later') }),
  perIp(40, 15 * 60 * 1000, 'Too many attempts — please try again later')
]

// Failed sign-ins only (successful ones are not counted). Three counters:
//  - per email AND visitor: stops guessing without letting a stranger lock the real student out
//  - per email in total: stops guessing spread across many networks
//  - per visitor: stops one network trying many accounts
const failedOnly = { skipSuccessfulRequests: true as const }
export const loginLimiters = [
  rateLimit({ windowMs: 15 * 60 * 1000, max: () => (isProd() ? 8 : 200), keyGenerator: req => `${emailOf(req)}|${visitorOf(req)}`, message: tooMany('Too many failed sign-in attempts — please try again in a few minutes'), ...failedOnly }),
  rateLimit({ windowMs: 15 * 60 * 1000, max: () => (isProd() ? 40 : 1000), keyGenerator: emailOf, message: tooMany('Too many failed sign-in attempts for this account — please try again later'), ...failedOnly }),
  rateLimit({ windowMs: 15 * 60 * 1000, max: () => (isProd() ? 60 : 2000), keyGenerator: visitorOf, message: tooMany('Too many failed sign-in attempts from this network — please try again later'), ...failedOnly })
]

// Suspension appeals check a password too
export const appealLimiters = [
  rateLimit({ windowMs: 15 * 60 * 1000, max: () => (isProd() ? 5 : 100), keyGenerator: req => `${emailOf(req)}|${visitorOf(req)}`, message: tooMany('Too many attempts for this account. Please try again later.'), ...failedOnly }),
  rateLimit({ windowMs: 15 * 60 * 1000, max: () => (isProd() ? 30 : 600), keyGenerator: emailOf, message: tooMany('Too many attempts for this account. Please try again later.'), ...failedOnly })
]
