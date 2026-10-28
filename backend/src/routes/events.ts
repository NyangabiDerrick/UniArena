import { Router } from 'express'
import { body } from 'express-validator'
import { getEvents, getEventById, createEvent, purchaseTicket } from '../controllers/events/eventsController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', getEvents)
router.get('/:id', getEventById)
router.post('/',
  authenticate,
  requireRole(ROLES.CLUB_LEADER, ROLES.SPORTS_CAPTAIN, ROLES.ADMIN),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('startsAt').isISO8601().withMessage('Valid start date is required'),
    body('endsAt').isISO8601().withMessage('Valid end date is required'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
  ],
  validate,
  createEvent
)
router.post('/:id/tickets', authenticate, purchaseTicket)

export default router