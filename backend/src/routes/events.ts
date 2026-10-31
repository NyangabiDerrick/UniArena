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
  requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN),
  [
    body('title').trim().notEmpty().isLength({ max: 200 }),
    body('venue').trim().notEmpty(),
    body('startsAt').isISO8601(),
    body('endsAt').isISO8601(),
    body('capacity').isInt({ min: 1 })
  ],
  validate,
  createEvent
)
router.post('/:id/tickets', authenticate, purchaseTicket)

export default router