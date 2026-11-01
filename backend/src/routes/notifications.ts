import { Router } from 'express'
import { getMyNotifications, markAllRead, markRead } from '../controllers/notifications/notificationsController'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.get('/', getMyNotifications)
router.put('/read-all', markAllRead)
router.put('/:id/read', markRead)

export default router