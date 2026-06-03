import { Router } from 'express'
import {
  getClubs, getClubById, createClub,
  joinClub, getClubMembers, updateMembership
} from '../controllers/clubs/clubsController'
import { authenticate, requireRole, ROLES } from '../middleware/auth'

const router = Router()

router.get('/', getClubs)
router.get('/:id', getClubById)
router.post('/', authenticate, requireRole(ROLES.STUDENT, ROLES.ADMIN), createClub)
router.post('/:id/join', authenticate, requireRole(ROLES.STUDENT), joinClub)
router.get('/:id/members', authenticate, getClubMembers)
router.put('/:id/members/:userId', authenticate, requireRole(ROLES.CLUB_LEADER, ROLES.ADMIN), updateMembership)

export default router