import { Router } from 'express'
import {
  getUsers, updateUser,
  getPendingClubs, approveClub,
  getPendingEvents, approveEvent,
  getAuditLogs, getAnalytics
} from '../controllers/admin/adminController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(requireRole(ROLES.ADMIN, ROLES.MODERATOR))

router.get('/users', getUsers)
router.put('/users/:id', updateUser)
router.get('/approvals/clubs', getPendingClubs)
router.put('/approvals/clubs/:id', approveClub)
router.get('/approvals/events', getPendingEvents)
router.put('/approvals/events/:id', approveEvent)
router.get('/audit-logs', getAuditLogs)
router.get('/analytics', getAnalytics)

export default router