import { Router } from 'express'
import {
  getUsers, updateUser, assignLeader,
  getPendingClubs, approveClub,
  getPendingEvents, approveEvent,
  getAuditLogs, getAnalytics
} from '../controllers/admin/adminController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'

const router = Router()

router.use(authenticate)
router.use(requireRole(ROLES.ADMIN, ROLES.MODERATOR))

router.get('/users', getUsers)
router.put('/users/:id', requireRole(ROLES.ADMIN), updateUser)
router.put('/users/:id/leader', requireRole(ROLES.ADMIN), assignLeader)
router.get('/approvals/clubs', getPendingClubs)
router.put('/approvals/clubs/:id', approveClub)
router.get('/approvals/events', getPendingEvents)
router.put('/approvals/events/:id', approveEvent)
router.get('/audit-logs', getAuditLogs)
router.get('/analytics', getAnalytics)

export default router