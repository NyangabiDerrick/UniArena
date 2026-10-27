import rateLimit from 'express-rate-limit'

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests — please try again later'
  }
})

// Per IP: used for register, forgot-password and reset-password
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many attempts — please try again later'
  }
})

// Per email address: used for login, because NextAuth makes every
// login request from the same server IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => String(req.body?.email || 'unknown').toLowerCase(),
  message: {
    success: false,
    message: 'Too many login attempts for this account — please try again later'
  }
})