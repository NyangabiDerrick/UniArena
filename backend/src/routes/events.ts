import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import {
  getEvents, getEventById, createEvent, purchaseTicket, getMyTickets, getEventCategories
} from '../controllers/events/eventsController'
import {
  listManagedEvents, cancelEvent, suspendEvent, restoreEvent
} from '../controllers/events/eventModerationController'
import { reportEvent } from '../controllers/admin/contentReportsController'
import { authenticate, requireRole, AuthRequest, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const managers = requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN)
const reason = body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Give a reason of at least 5 characters')

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: req => (req as AuthRequest).user?.id ?? 'anonymous',
  message: { success: false, message: 'You have sent several reports already. Please try again later.' }
})

router.get('/', getEvents)
router.get('/tickets/mine', authenticate, getMyTickets)
router.get('/categories', authenticate, managers, getEventCategories)
router.get('/managed', authenticate, managers, listManagedEvents)
router.get('/:id', getEventById)
router.post('/',
  authenticate,
  managers,
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('category').isIn(['SOCIAL', 'CLUB', 'SPORTS', 'UNIVERSITY', 'ACADEMIC']),
    body('venue').trim().notEmpty().isLength({ max: 200 }),
    body('description').optional({ nullable: true }).isString().isLength({ max: 3000 }),
    body('startsAt').isISO8601(),
    body('endsAt').isISO8601(),
    body('capacity').isInt({ min: 1, max: 100000 })
  ],
  validate,
  createEvent
)
router.put('/:id/cancel', authenticate, managers, [reason], validate, cancelEvent)
router.put('/:id/suspend', authenticate, managers, [reason], validate, suspendEvent)
router.put('/:id/restore', authenticate, managers, restoreEvent)
router.post('/:id/tickets', authenticate, purchaseTicket)
router.post('/:id/report',
  authenticate,
  reportLimiter,
  [
    body('reason').isIn(['SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'OTHER']),
    body('details').optional({ nullable: true }).isString().isLength({ max: 1000 })
  ],
  validate,
  reportEvent
)

export default router