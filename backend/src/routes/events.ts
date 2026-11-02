import { Router } from 'express'
import { body } from 'express-validator'
import {
  getEvents, getEventById, createEvent, purchaseTicket, getMyTickets, getEventCategories
} from '../controllers/events/eventsController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', getEvents)
router.get('/tickets/mine', authenticate, getMyTickets)
router.get('/categories', authenticate, requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN), getEventCategories)
router.get('/:id', getEventById)
router.post('/',
  authenticate,
  requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN),
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
router.post('/:id/tickets', authenticate, purchaseTicket)

export default router