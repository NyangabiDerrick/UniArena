import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import {
  register, login, forgotPassword, resetPassword, verifyEmail, resendVerification
} from '../controllers/auth/authController'
import { policyStatus, acceptPolicy } from '../controllers/auth/policyController'
import { validate } from '../middleware/validate'
import { authenticate, AuthRequest } from '../middleware/auth'
import {
  registerLimiter, verifyEmailLimiter, resetPasswordLimiter, forgotPasswordLimiters, loginLimiters
} from '../middleware/rateLimiter'
import { MIN_PASSWORD_LENGTH } from '../utils/passwordPolicy'

const router = Router()
const password = body('password').isLength({ min: MIN_PASSWORD_LENGTH, max: 100 }).withMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)

const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: req => (req as AuthRequest).user?.id ?? 'anonymous',
  message: { success: false, message: 'You asked for several emails already. Please check your inbox and spam folder, or try again later.' }
})

router.post('/register', registerLimiter,
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('studentId').trim().notEmpty(),
    body('acceptedPolicy').equals('true').withMessage('You must accept the Terms and Data Policy'),
    password
  ],
  validate, register)

router.post('/login', ...loginLimiters,
  [body('email').isEmail(), body('password').notEmpty()],
  validate, login)

router.post('/forgot-password', ...forgotPasswordLimiters, [body('email').isEmail()], validate, forgotPassword)

router.post('/reset-password', resetPasswordLimiter,
  [body('token').notEmpty(), password],
  validate, resetPassword)

router.post('/verify-email', verifyEmailLimiter, [body('token').isString().notEmpty()], validate, verifyEmail)

router.post('/resend-verification', authenticate, resendLimiter, resendVerification)

router.get('/policy-status', authenticate, policyStatus)
router.post('/accept-policy', authenticate, acceptPolicy)

export default router