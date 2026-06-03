import { Router } from 'express'
import { getEvents, getEventById, createEvent, purchaseTicket } from '../controllers/events/eventsController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'

const router = Router()

router.get('/', getEvents)
router.get('/:id', getEventById)
router.post('/', authenticate, requireRole(ROLES.CLUB_LEADER, ROLES.SPORTS_CAPTAIN, ROLES.ADMIN), createEvent)
router.post('/:id/tickets', authenticate, purchaseTicket)

export default router