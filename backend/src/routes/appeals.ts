import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { submitAppeal } from '../controllers/auth/appealsController'
import { validate } from '../middleware/validate'

const router = Router()

// This endpoint checks a password, so guessing is limited per email address
const appealLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: req => String(req.body?.email || 'unknown').toLowerCase(),
  message: { success: false, message: 'Too many attempts for this account. Please try again later.' }
})

router.post('/',
  appealLimiter,
  [
    body('email').isEmail(),
    body('password').isString().notEmpty(),
    body('message').isString().trim().isLength({ min: 10, max: 1500 }).withMessage('Please explain in at least 10 characters')
  ],
  validate,
  submitAppeal
)

export default router