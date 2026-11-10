import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { postComment, reportComment } from '../controllers/comments/commentsController'
import { authenticate, AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const perUser = (req: unknown) => (req as AuthRequest).user?.id ?? 'anonymous'

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: perUser,
  message: { success: false, message: 'You are commenting too fast. Please wait a moment.' }
})

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: perUser,
  message: { success: false, message: 'You have sent several reports already. Please try again later.' }
})

router.post('/articles/:id/comments',
  authenticate,
  commentLimiter,
  [body('content').isString().trim().isLength({ min: 1, max: 1000 })],
  validate,
  postComment
)

router.post('/comments/:id/report',
  authenticate,
  reportLimiter,
  [
    body('reason').isIn(['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'OTHER']),
    body('details').optional({ nullable: true }).isString().isLength({ max: 1000 })
  ],
  validate,
  reportComment
)

export default router