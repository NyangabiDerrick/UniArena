import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import {
  getConversations, getThread, sendMessage, getContacts, getUnreadCount,
  getBlocks, blockUser, unblockUser, reportUser
} from '../controllers/messages/messagesController'
import { authenticate, AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const perUser = (req: unknown) => (req as AuthRequest).user?.id ?? 'anonymous'

// 30 messages a minute per signed-in user
const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: perUser,
  message: { success: false, message: 'You are sending messages too fast. Please wait a moment.' }
})

// 5 reports an hour per signed-in user
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: perUser,
  message: { success: false, message: 'You have sent several reports already. Please try again later.' }
})

router.use(authenticate)

router.get('/conversations', getConversations)
router.get('/contacts', getContacts)
router.get('/unread-count', getUnreadCount)
router.get('/thread/:userId', getThread)
router.post('/',
  sendLimiter,
  [body('receiverId').isString().notEmpty(), body('content').isString().trim().isLength({ min: 1, max: 2000 })],
  validate,
  sendMessage
)

router.get('/blocks', getBlocks)
router.post('/blocks', [body('userId').isString().notEmpty()], validate, blockUser)
router.delete('/blocks/:userId', unblockUser)

router.post('/reports',
  reportLimiter,
  [
    body('userId').isString().notEmpty(),
    body('reason').isIn(['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'OTHER']),
    body('details').optional({ nullable: true }).isString().isLength({ max: 1000 })
  ],
  validate,
  reportUser
)

export default router