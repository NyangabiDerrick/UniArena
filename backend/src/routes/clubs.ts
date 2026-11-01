import { Router } from 'express'
import { body } from 'express-validator'
import {
  getClubs, getClubById, getMyClub, createClub,
  joinClub, getClubMembers, updateMembership
} from '../controllers/clubs/clubsController'
import { authenticate, requireRole, requireGroupManager, ROLES } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

router.get('/', getClubs)
router.get('/mine', authenticate, requireRole(ROLES.CLUB_LEADER), getMyClub)
router.get('/:id', getClubById)
router.post('/',
  authenticate,
  requireRole(ROLES.STUDENT, ROLES.ADMIN),
  [
    body('name').trim().notEmpty().isLength({ max: 100 }),
    body('description').trim().notEmpty().isLength({ max: 1000 }),
    body('category').trim().notEmpty()
  ],
  validate,
  createClub
)
router.post('/:id/join', authenticate, requireRole(ROLES.STUDENT), joinClub)
router.get('/:id/members', authenticate, requireGroupManager('club'), getClubMembers)
router.put('/:id/members/:userId',
  authenticate,
  requireGroupManager('club'),
  [body('status').isIn(['ACTIVE', 'REJECTED', 'BANNED'])],
  validate,
  updateMembership
)

export default router