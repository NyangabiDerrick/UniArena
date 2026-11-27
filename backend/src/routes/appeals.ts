import { Router } from 'express'
import { body } from 'express-validator'
import { appealLimiters } from '../middleware/rateLimiter'
import { submitAppeal } from '../controllers/auth/appealsController'
import { validate } from '../middleware/validate'

const router = Router()

router.post('/',
  ...appealLimiters,
  [
    body('email').isEmail(),
    body('password').isString().notEmpty(),
    body('message').isString().trim().isLength({ min: 10, max: 1500 }).withMessage('Please explain in at least 10 characters')
  ],
  validate,
  submitAppeal
)

export default router