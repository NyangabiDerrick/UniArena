import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import {
  getConversations, getThread, sendMessage, getContacts, getUnreadCount
} from '../controllers/messages/messagesController'
import { authenticate, AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

// 30 messages a minute per signed-in user
const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: req => (req as AuthRequest).user?.id ?? 'anonymous',
  message: { success: false, message: 'You are sending messages too fast. Please wait a moment.' }
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

export default router