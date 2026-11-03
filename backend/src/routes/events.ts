import { Router } from 'express'
import { body } from 'express-validator'
import {
  getEvents, getEventById, createEvent, purchaseTicket, getMyTickets, getEventCategories
} from '../controllers/events/eventsController'
import {
  listManagedEvents, cancelEvent, suspendEvent, restoreEvent
} from '../controllers/events/eventModerationController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const managers = requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN)
const reason = body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Give a reason of at least 5 characters')

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

export default router